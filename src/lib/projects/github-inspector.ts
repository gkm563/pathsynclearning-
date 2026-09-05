import "server-only";

export type GithubInspectResult = {
  ok: boolean;
  error?: string;
  owner?: string;
  repo?: string;
  hasReadme: boolean;
  paths: string[];
  recentCommits: number;
  defaultBranch?: string;
};

function parseGithubUrl(raw: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(raw.trim());
    if (!/github\.com$/i.test(u.hostname) && u.hostname !== "www.github.com") {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

/**
 * Lightweight public GitHub inspection (Phase 2).
 * Uses unauthenticated API — rate-limited; fails soft.
 */
export async function inspectGithubRepo(
  repoUrl: string,
): Promise<GithubInspectResult> {
  const empty: GithubInspectResult = {
    ok: false,
    hasReadme: false,
    paths: [],
    recentCommits: 0,
  };
  if (!repoUrl?.trim()) {
    return { ...empty, error: "Repository URL required for GitHub checks" };
  }
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) {
    return { ...empty, error: "Provide a valid github.com repository URL" };
  }

  const { owner, repo } = parsed;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "PathED-ProjectChecker",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!repoRes.ok) {
      return {
        ...empty,
        owner,
        repo,
        error: `GitHub repo lookup failed (${repoRes.status})`,
      };
    }
    const repoJson = (await repoRes.json()) as { default_branch?: string };
    const branch = repoJson.default_branch || "main";

    const [readmeRes, treeRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
        { headers },
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
        { headers },
      ),
    ]);

    const hasReadme = readmeRes.ok;
    let paths: string[] = [];
    if (treeRes.ok) {
      const treeJson = (await treeRes.json()) as {
        tree?: { path?: string; type?: string }[];
      };
      paths = (treeJson.tree || [])
        .filter((t) => t.type === "blob" && t.path)
        .map((t) => t.path as string)
        .slice(0, 500);
    }
    let recentCommits = 0;
    if (commitsRes.ok) {
      const commits = (await commitsRes.json()) as unknown[];
      recentCommits = Array.isArray(commits) ? commits.length : 0;
    }

    return {
      ok: true,
      owner,
      repo,
      hasReadme,
      paths,
      recentCommits,
      defaultBranch: branch,
    };
  } catch (e) {
    return {
      ...empty,
      owner,
      repo,
      error: e instanceof Error ? e.message : "GitHub inspect failed",
    };
  }
}
