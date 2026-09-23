import "server-only";
import { callAIWithFallback } from "@/lib/ai/llm";
import { copilotSystemInstruction, buildCopilotPrompt } from "./copilot-prompt";
import type { CopilotStudentContext } from "./copilot-context";
import { normalizeCopilotHref } from "./copilot-href";
import { routes } from "@/lib/routes";
import {
  copilotFallbackReply,
  copilotNewsSearchQuery,
  copilotScopeRefusal,
  wantsCopilotNews,
} from "./copilot-scope";
import { executeCopilotReadTool, isReadTool, type CopilotReadTool } from "./copilot-tools";
import type {
  CopilotHistoryTurn,
  CopilotNavigate,
  CopilotProposedWrite,
} from "./copilot-types";
import type { CopilotInteract, CopilotUiSnapshotItem } from "./copilot-interact";

type ToolCall = { name: string; arguments: Record<string, unknown> };

type CopilotJson = {
  in_scope?: unknown;
  reply?: unknown;
  tool_calls?: unknown;
  navigate?: unknown;
  interact?: unknown;
  proposed_writes?: unknown;
};

function unescapeReply(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function asReply(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return unescapeReply(raw);
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as CopilotJson & Record<string, unknown>;
  const reply = rec.reply ?? rec.text ?? rec.message;
  if (typeof reply === "string" && reply.trim()) return unescapeReply(reply);
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseToolCalls(raw: unknown): ToolCall[] {
  if (!Array.isArray(raw)) return [];
  const out: ToolCall[] = [];
  for (const item of raw.slice(0, 4)) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name) continue;
    const args = asRecord(rec.arguments) || asRecord(rec.args) || {};
    out.push({ name, arguments: args });
  }
  return out;
}

function parseNavigate(raw: unknown, extra: ToolCall[]): CopilotNavigate[] {
  const items: CopilotNavigate[] = [];
  const push = (href: unknown, label: unknown) => {
    if (typeof href !== "string") return;
    const clean = normalizeCopilotHref(href);
    if (!clean) return;
    const text =
      typeof label === "string" && label.trim() ? label.trim().slice(0, 80) : "Open";
    if (items.some((n) => n.href === clean)) return;
    items.push({ href: clean, label: text });
  };

  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 4)) {
      const rec = asRecord(item);
      if (rec) push(rec.href, rec.label);
    }
  }

  for (const call of extra) {
    if (call.name === "open_route") {
      push(call.arguments.href, call.arguments.label);
    }
  }

  return items.slice(0, 4);
}

function parseInteract(raw: unknown, extra: ToolCall[]): CopilotInteract[] {
  const items: CopilotInteract[] = [];
  const push = (id: unknown, label: unknown, href: unknown) => {
    const next: CopilotInteract = { type: "click" };
    if (typeof id === "string" && id.trim()) next.id = id.trim().slice(0, 80);
    if (typeof label === "string" && label.trim()) next.label = label.trim().slice(0, 80);
    if (typeof href === "string" && href.startsWith("/") && !href.startsWith("//")) {
      next.href = href.trim().split("#")[0].slice(0, 240);
    }
    if (!next.id && !next.label && !next.href) return;
    if (
      items.some(
        (item) =>
          item.id === next.id && item.label === next.label && item.href === next.href,
      )
    ) {
      return;
    }
    items.push(next);
  };

  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 4)) {
      const rec = asRecord(item);
      if (!rec) continue;
      push(rec.id, rec.label, rec.href);
    }
  }

  for (const call of extra) {
    if (call.name === "click_ui" || call.name === "click" || call.name === "press") {
      push(call.arguments.id, call.arguments.label, call.arguments.href);
    }
  }

  return items.slice(0, 3);
}

function parseProposedWrites(
  raw: unknown,
  extra: ToolCall[],
): CopilotProposedWrite[] {
  const items: CopilotProposedWrite[] = [];

  const push = (rec: Record<string, unknown> | null) => {
    if (!rec) return;
    const type = typeof rec.type === "string" ? rec.type : rec.name;
    if (type === "create_note") {
      const title = typeof rec.title === "string" ? rec.title.trim() : "";
      const content = typeof rec.content === "string" ? rec.content.trim() : "";
      if (!title || !content) return;
      items.push({
        type: "create_note",
        title: title.slice(0, 200),
        content: content.slice(0, 12000),
        summary:
          (typeof rec.summary === "string" && rec.summary.trim()) ||
          `Save note: ${title.slice(0, 80)}`,
      });
      return;
    }
    if (type === "bookmark_news") {
      const articleId =
        typeof rec.articleId === "string"
          ? rec.articleId
          : typeof rec.article_id === "string"
            ? rec.article_id
            : "";
      if (!articleId) return;
      items.push({
        type: "bookmark_news",
        articleId,
        bookmarked: rec.bookmarked === false ? false : true,
        title: typeof rec.title === "string" ? rec.title.slice(0, 200) : undefined,
        summary:
          (typeof rec.summary === "string" && rec.summary.trim()) ||
          "Bookmark this article",
      });
    }
  };

  if (Array.isArray(raw)) {
    for (const item of raw.slice(0, 3)) push(asRecord(item));
  }
  for (const call of extra) {
    if (call.name === "create_note" || call.name === "bookmark_news") {
      push({ type: call.name, ...call.arguments });
    }
  }

  return items.slice(0, 2);
}

function parseInScope(raw: unknown): boolean | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const v = rec.in_scope ?? rec.inScope;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes") return true;
    if (s === "false" || s === "no") return false;
  }
  return null;
}

const GEMINI_SCHEMA = {
  type: "object",
  properties: {
    in_scope: { type: "boolean" },
    reply: { type: "string" },
    tool_calls: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          arguments: { type: "object" },
        },
      },
    },
    navigate: {
      type: "array",
      items: {
        type: "object",
        properties: {
          href: { type: "string" },
          label: { type: "string" },
        },
      },
    },
    interact: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          id: { type: "string" },
          label: { type: "string" },
          href: { type: "string" },
        },
      },
    },
    proposed_writes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          summary: { type: "string" },
          articleId: { type: "string" },
          bookmarked: { type: "boolean" },
        },
      },
    },
  },
  required: ["in_scope", "reply"],
};

export async function runCopilotTurn(input: {
  userId: string;
  ctx: CopilotStudentContext;
  message: string;
  history: CopilotHistoryTurn[];
  ui?: CopilotUiSnapshotItem[];
}): Promise<{
  reply: string;
  navigate: CopilotNavigate[];
  interact: CopilotInteract[];
  proposedWrites: CopilotProposedWrite[];
  refused?: boolean;
  fallback?: boolean;
}> {
  const toolResults: string[] = [];
  if (wantsCopilotNews(input.message)) {
    try {
      const result = await executeCopilotReadTool(input.userId, "list_news", {
        query: copilotNewsSearchQuery(input.message),
      });
      toolResults.push(`list_news: ${JSON.stringify(result).slice(0, 1800)}`);
    } catch {
      // snapshot.news still available
    }
  }

  for (let round = 0; round < 3; round++) {
    const prompt = buildCopilotPrompt(
      input.ctx,
      input.message,
      input.history,
      toolResults,
      input.ui || [],
    );

    let raw: CopilotJson;
    try {
      raw = await callAIWithFallback<CopilotJson>({
        prompt,
        systemInstruction: copilotSystemInstruction(input.ctx.companion.name),
        userId: input.userId,
        groqModel: "llama-3.3-70b-versatile",
        geminiSchema: GEMINI_SCHEMA,
        maxTokens: 800,
        timeoutMs: 25000,
        temperature: 0.3,
        reasoningEffort: "low",
      });
    } catch {
      return {
        reply: copilotFallbackReply(input.ctx.companion.name),
        navigate: [],
        interact: [],
        proposedWrites: [],
        fallback: true,
      };
    }

    if (parseInScope(raw) === false) {
      return {
        reply: copilotScopeRefusal("off_topic", input.ctx.companion.name),
        navigate: [],
        interact: [],
        proposedWrites: [],
        refused: true,
      };
    }

    const calls = parseToolCalls(raw.tool_calls);
    const reads = calls.filter((c): c is ToolCall & { name: CopilotReadTool } =>
      isReadTool(c.name),
    );

    if (reads.length && round < 2) {
      for (const call of reads.slice(0, 3)) {
        try {
          const result = await executeCopilotReadTool(
            input.userId,
            call.name,
            call.arguments,
          );
          toolResults.push(
            `${call.name}: ${JSON.stringify(result).slice(0, 1800)}`,
          );
        } catch (err) {
          toolResults.push(
            `${call.name}: ${err instanceof Error ? err.message : "failed"}`,
          );
        }
      }
      continue;
    }

    const reply = asReply(raw) || copilotFallbackReply(input.ctx.companion.name);
    const navigate = parseNavigate(raw.navigate, calls);
    if (
      wantsCopilotNews(input.message) &&
      !navigate.some((item) => item.href.startsWith(routes.app.techNews))
    ) {
      navigate.unshift({ href: routes.app.techNews, label: "Tech News" });
    }
    return {
      reply,
      navigate: navigate.slice(0, 4),
      interact: parseInteract(raw.interact, calls),
      proposedWrites: parseProposedWrites(raw.proposed_writes, calls),
      fallback: !asReply(raw),
    };
  }

  return {
    reply: copilotFallbackReply(input.ctx.companion.name),
    navigate: [],
    interact: [],
    proposedWrites: [],
    fallback: true,
  };
}
