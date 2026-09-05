/** Conservative markdown → HTML for Dev.to article bodies. Input is escaped first. */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  return null;
}

function inlineFormat(escaped: string): string {
  return escaped
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, href) => {
      const url = safeUrl(href.replace(/&amp;/g, "&"));
      if (!url || !url.startsWith("http")) return alt || "";
      return `<img src="${escapeHtml(url)}" alt="${alt}" loading="lazy" />`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const url = safeUrl(href.replace(/&amp;/g, "&"));
      if (!url) return label;
      const abs = url.startsWith("http")
        ? ` href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"`
        : ` href="${escapeHtml(url)}"`;
      return `<a${abs}>${label}</a>`;
    });
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function looksLikeHtml(content: string): boolean {
  const t = content.trim();
  return t.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(t);
}

export function renderNewsContent(content: string): string {
  const trimmed = content.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeHtml(trimmed);

  const withoutLiquid = trimmed.replace(/\{%[\s\S]*?%\}/g, "").trim();
  const fences: string[] = [];
  const withFences = withoutLiquid.replace(
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g,
    (_m, lang, code) => {
      const i = fences.length;
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      fences.push(
        `<pre><code${cls}>${escapeHtml(String(code).replace(/\n$/, ""))}</code></pre>`,
      );
      return `\n%%FENCE${i}%%\n`;
    },
  );

  const blocks = withFences.split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const b = block.trim();
      if (!b) return "";
      const fence = b.match(/^%%FENCE(\d+)%%$/);
      if (fence) return fences[Number(fence[1])] || "";

      if (/^#{1,6}\s/.test(b)) {
        return b
          .split("\n")
          .map((line) => {
            const m = line.match(/^(#{1,6})\s+(.+)$/);
            if (!m) return `<p>${inlineFormat(escapeHtml(line))}</p>`;
            const level = Math.min(m[1].length, 4) + 1;
            return `<h${level}>${inlineFormat(escapeHtml(m[2]))}</h${level}>`;
          })
          .join("");
      }

      if (/^>\s?/m.test(b)) {
        const quote = b
          .split("\n")
          .map((l) => l.replace(/^>\s?/, ""))
          .join(" ");
        return `<blockquote>${inlineFormat(escapeHtml(quote))}</blockquote>`;
      }

      if (/^[-*+]\s+/m.test(b) && b.split("\n").every((l) => /^[-*+]\s+|^\s*$/.test(l))) {
        const items = b
          .split("\n")
          .filter(Boolean)
          .map((l) => `<li>${inlineFormat(escapeHtml(l.replace(/^[-*+]\s+/, "")))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      if (/^\d+\.\s+/m.test(b) && b.split("\n").every((l) => /^\d+\.\s+|^\s*$/.test(l))) {
        const items = b
          .split("\n")
          .filter(Boolean)
          .map((l) => `<li>${inlineFormat(escapeHtml(l.replace(/^\d+\.\s+/, "")))}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }

      const withBreaks = escapeHtml(b).replace(/\n/g, "<br />");
      return `<p>${inlineFormat(withBreaks)}</p>`;
    })
    .filter(Boolean)
    .join("");

  return html.replace(/\[\+\d+\s*chars?\]/gi, "");
}
