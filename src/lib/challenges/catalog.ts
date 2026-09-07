import type {
  ChallengeDifficulty,
  ChallengeIconKey,
  ChallengeQuestion,
  ChallengeType,
} from "@/lib/challenges/types";
import type { ChallengeCodingHarness } from "@/lib/challenges/coding-harness";
import type { ProjectAssessmentSpec } from "@/lib/projects/types";

type RawChallenge = {
  id: string;
  type: "CODE" | "MCQ" | "PROJECT" | "MILESTONE";
  icon: ChallengeIconKey;
  label: string;
  cat: string;
  diff: string;
  xp: number;
  coins?: number;
  time: string;
  desc: string;
  problem?: string;
  examples?: string;
  companyTags?: string[];
  hints?: string[];
  solution?: { editorial: string; complexity: string; notes?: string };
  weeklyBossEligible?: boolean;
  coding?: ChallengeCodingHarness;
  project?: ProjectAssessmentSpec;
  testCases?: { id: number; name: string; input: string; expected: string }[];
  questions?: {
    id: number;
    q: string;
    opts: string[];
    correct: number;
    explanation?: string;
  }[];
};

const CAREER_DEFAULTS = [
  "Software Engineer",
  "Full Stack Developer",
  "Backend Engineer",
  "Frontend Engineer",
  "SDE",
];

function mapType(t: RawChallenge["type"]): ChallengeType {
  if (t === "MCQ") return "mcq";
  if (t === "PROJECT" || t === "MILESTONE") return "project";
  return "coding";
}

function mapDiff(d: string): ChallengeDifficulty {
  const x = d.toLowerCase();
  if (x === "easy") return "easy";
  if (x === "hard" || x === "milestone") return "hard";
  return "medium";
}

function parseMinutes(time: string): number {
  const h = time.match(/(\d+)\s*hr/i);
  const m = time.match(/(\d+)\s*min/i);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0) || 30;
}

function topicsFor(cat: string, label: string): string[] {
  const base = [cat.toLowerCase()];
  const blob = `${cat} ${label}`.toLowerCase();
  if (/tree|bst|binary/.test(blob)) base.push("trees", "bst", "dsa");
  if (/list|linked/.test(blob)) base.push("linked-lists", "dsa");
  if (/two\s*sum|array|hash/.test(blob)) base.push("arrays", "hashing", "dsa");
  if (/rate|limiter|cache|distributed|cap|hash/.test(blob))
    base.push("system-design", "distributed-systems");
  if (/react|debounce|hook|frontend|web/.test(blob))
    base.push("react", "frontend", "javascript");
  if (/osi|tcp|tls|network|udp/.test(blob)) base.push("networking", "os");
  if (/sql|dbms|index|3nf|postgres|b\+/.test(blob))
    base.push("databases", "sql", "dbms");
  if (/python|cli|memory|hash/.test(blob)) base.push("python", "projects");
  if (/graph|bfs|dfs/.test(blob)) base.push("graphs", "dsa");
  if (/dp|dynamic/.test(blob)) base.push("dynamic-programming", "dsa");
  return [...new Set(base)];
}

function careerTagsFor(cat: string, type: ChallengeType): string[] {
  const tags = [...CAREER_DEFAULTS];
  if (cat === "WEB DEV" || /react|frontend/i.test(cat)) {
    tags.push("Frontend Engineer", "React Developer");
  }
  if (cat === "SYSTEM DESIGN" || type === "project") {
    tags.push("Backend Engineer", "Staff Engineer", "Platform Engineer");
  }
  if (cat === "DBMS" || cat === "THEORY") {
    tags.push("Data Engineer", "Backend Engineer");
  }
  return [...new Set(tags)];
}

/** Source bank — Lucide icon keys only (no emojis). */
const RAW: RawChallenge[] = [
  {
    id: "m_capstone",
    type: "MILESTONE",
    icon: "trophy",
    label: "Design & Build a Distributed Low-Latency Event Cache Engine",
    cat: "SYSTEM DESIGN",
    diff: "Milestone",
    xp: 500,
    coins: 16,
    time: "3 hrs",
    desc: "Create a thread-safe, high-concurrency event cache with LRU eviction, sliding window rate limiting, and durable WAL recovery.",
    companyTags: ["Google", "Amazon", "Uber"],
    weeklyBossEligible: true,
    hints: [
      "Start with a doubly linked list + hash map for O(1) LRU.",
      "Token bucket or sliding log both work; prefer sliding window for interview clarity.",
      "Persist every mutation before acknowledging the write.",
    ],
    solution: {
      editorial:
        "Combine an ordered dictionary (hash + DLL) for LRU with a per-key token bucket. Append mutations to a JSON WAL; on boot, replay the log into memory.",
      complexity: "get/set O(1) amortized; recovery O(n log entries)",
      notes: "Discuss clock skew and multi-node Redlock only after single-node correctness.",
    },
    problem: `Design and implement a High-Concurrency Event Cache Engine:
1. Thread-safe LRU eviction with O(1) get/put.
2. Sliding-window rate limiting per client API key.
3. Persistent JSON write-ahead log for crash recovery.
4. REST: POST /cache/set, GET /cache/get/:key, GET /metrics.`,
    examples: `POST /cache/set {"key":"usr_99","val":{"role":"admin"},"ttl":3600}\n→ 201 {"status":"ok"}`,
    testCases: [
      { id: 1, name: "Put & Get", input: "set then get", expected: "value returned" },
      { id: 2, name: "LRU Eviction", input: "capacity+1 inserts", expected: "oldest evicted" },
      { id: 3, name: "Rate Limit", input: "101 req / 10s", expected: "429" },
      { id: 4, name: "WAL Recovery", input: "crash + replay", expected: "state restored" },
    ],
    project: {
      type: "project",
      passScore: 70,
      timeLimitMinutes: 180,
      overview: {
        goal: "Design and build a thread-safe event cache with LRU eviction, sliding-window rate limiting, and WAL recovery.",
        stack: ["Your language of choice", "HTTP API", "JSON WAL", "Git"],
        deliverables: [
          "LRU cache core",
          "Per-key rate limiter",
          "WAL persistence + recovery",
          "README with API and design notes",
        ],
        estimatedHours: 6,
      },
      steps: [
        {
          id: "design",
          title: "Write the design brief",
          instructions:
            "Document data structures for O(1) LRU, rate-limit approach, and WAL format. List APIs: set, get, metrics.",
          acceptance: [
            "LRU approach documented",
            "Rate limit approach documented",
            "WAL format sketched",
          ],
          requiredEvidence: ["notes"],
        },
        {
          id: "lru",
          title: "Implement LRU core",
          instructions:
            "Build thread-safe get/put with capacity eviction. Add unit tests or a demo script.",
          acceptance: [
            "Get/put works",
            "Eviction removes oldest",
            "Concurrency considered",
          ],
          requiredEvidence: ["repo_url", "screenshot_url"],
        },
        {
          id: "ratelimit-wal",
          title: "Add rate limit and WAL",
          instructions:
            "Attach sliding-window or token-bucket limiting. Persist mutations to a JSON WAL and replay on boot.",
          acceptance: [
            "Over-limit requests rejected",
            "WAL written before ack",
            "Recovery restores state",
          ],
          requiredEvidence: ["demo_url"],
        },
        {
          id: "ship",
          title: "Ship docs",
          instructions:
            "Finish README (API, complexity, recovery). Push to GitHub with clear commits.",
          acceptance: ["README complete", "Repo public or shareable"],
          requiredEvidence: ["repo_url", "notes"],
        },
      ],
      rubric: [
        { id: "checklist", label: "All guide steps completed", weight: 30, check: "checklist_complete" },
        { id: "evidence", label: "Required evidence submitted", weight: 25, check: "evidence_present" },
        {
          id: "reflection",
          label: "Reflection covers LRU, rate limit, WAL",
          weight: 15,
          check: "keyword_notes",
          keywords: ["lru", "rate", "wal", "cache", "evict", "recovery"],
        },
        { id: "gh_readme", label: "GitHub README present", weight: 15, check: "github_readme" },
        { id: "gh_commits", label: "Repository has commits", weight: 15, check: "github_commits" },
      ],
    },
  },
  {
    id: "c_dsa_1",
    type: "CODE",
    icon: "tree",
    label: "Binary Search on Sorted Array",
    cat: "DSA",
    diff: "Medium",
    xp: 150,
    time: "45 min",
    desc: "Return the index of target in a sorted array, or -1 if missing.",
    companyTags: ["Google", "Meta", "Microsoft"],
    hints: [
      "Keep lo/hi inclusive bounds.",
      "Use mid = lo + ((hi - lo) >> 1) to avoid overflow.",
      "Compare nums[mid] with target to shrink the window.",
    ],
    solution: {
      editorial: "Classic binary search — halve the search space each step.",
      complexity: "Time O(log n), Space O(1)",
    },
    problem:
      "Implement binarySearch(nums, target). nums is sorted ascending. Return index or -1.",
    examples: "nums = [-1,0,3,5,9,12], target = 9 → 4",
    coding: {
      functionName: "binarySearch",
      starterCode: `function binarySearch(nums, target) {\n  \n}\n`,
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      ],
      publicTests: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
        { args: [[5], 5], expected: 0 },
      ],
      hiddenTests: [
        { args: [[1, 2, 3, 4, 5], 1], expected: 0 },
        { args: [[1, 2, 3, 4, 5], 5], expected: 4 },
        { args: [[], 1], expected: -1 },
      ],
    },
  },
  {
    id: "c_dsa_2",
    type: "CODE",
    icon: "link",
    label: "Reverse an Array In-Place Pattern",
    cat: "DSA",
    diff: "Easy",
    xp: 80,
    time: "20 min",
    desc: "Return a new array that is the reverse of nums (linked-list reverse practice via arrays).",
    companyTags: ["Amazon", "Apple", "Bloomberg"],
    hints: [
      "Two pointers from both ends.",
      "Swap until they meet.",
      "Do not mutate the input if you prefer — return a new array.",
    ],
    solution: {
      editorial: "Mirror of linked-list reverse using index pointers.",
      complexity: "Time O(n), Space O(n) for returned copy",
    },
    problem: "Implement reverseArray(nums) returning the reversed values.",
    examples: "nums = [1,2,3] → [3,2,1]",
    coding: {
      functionName: "reverseArray",
      starterCode: `function reverseArray(nums) {\n  \n}\n`,
      examples: [
        { input: "nums = [1,2,3]", output: "[3,2,1]" },
        { input: "nums = [1]", output: "[1]" },
      ],
      publicTests: [
        { args: [[1, 2, 3]], expected: [3, 2, 1] },
        { args: [[1]], expected: [1] },
        { args: [[]], expected: [] },
      ],
      hiddenTests: [
        { args: [[9, 8, 7, 6]], expected: [6, 7, 8, 9] },
        { args: [[0, 0, 1]], expected: [1, 0, 0] },
      ],
    },
  },
  {
    id: "c_arrays_1",
    type: "CODE",
    icon: "bolt",
    label: "Two Sum with Hash Map",
    cat: "DSA",
    diff: "Easy",
    xp: 90,
    time: "25 min",
    desc: "Return indices of two numbers that add up to target in O(n).",
    companyTags: ["Google", "Amazon", "Adobe"],
    hints: [
      "Store value → index while scanning.",
      "Look for target - nums[i] in the map.",
      "Exactly one solution is guaranteed.",
    ],
    solution: {
      editorial: "Single pass hash map of complements.",
      complexity: "Time O(n), Space O(n)",
    },
    problem: "Implement twoSum(nums, target) returning [i, j].",
    examples: "nums = [2,7,11,15], target = 9 → [0,1]",
    coding: {
      functionName: "twoSum",
      starterCode: `function twoSum(nums, target) {\n  \n}\n`,
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ],
      publicTests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[3, 2, 4], 6], expected: [1, 2] },
      ],
      hiddenTests: [
        { args: [[3, 3], 6], expected: [0, 1] },
        { args: [[1, 5, 3, 7], 8], expected: [1, 2] },
      ],
    },
  },
  {
    id: "c_sys_1",
    type: "CODE",
    icon: "cpu",
    label: "Sliding Window Rate Limit Check",
    cat: "SYSTEM DESIGN",
    diff: "Hard",
    xp: 300,
    time: "90 min",
    desc: "Given sorted request timestamps, return how many would be allowed under limit per windowMs.",
    companyTags: ["Stripe", "Cloudflare", "Netflix"],
    weeklyBossEligible: true,
    hints: [
      "Two pointers or deque over the window.",
      "Drop timestamps older than t - windowMs.",
      "Count accepts while size < limit.",
    ],
    solution: {
      editorial: "Walk timestamps; keep a window of accepted times; accept when window size < limit.",
      complexity: "Time O(n), Space O(limit)",
    },
    problem:
      "allowedCount(timestamps, limit, windowMs) → number of requests that would be allowed.",
    examples: "timestamps=[1,2,3,10], limit=2, windowMs=5 → 3",
    coding: {
      functionName: "allowedCount",
      starterCode: `function allowedCount(timestamps, limit, windowMs) {\n  \n}\n`,
      examples: [
        { input: "timestamps = [1,2,3,10], limit = 2, windowMs = 5", output: "3" },
      ],
      publicTests: [
        { args: [[1, 2, 3, 10], 2, 5], expected: 3 },
        { args: [[1, 1, 1], 1, 1], expected: 1 },
        { args: [[5, 6, 7], 3, 10], expected: 3 },
      ],
      hiddenTests: [
        { args: [[0, 100, 200], 1, 50], expected: 3 },
        { args: [[1, 2, 3, 4, 5], 2, 100], expected: 2 },
      ],
    },
  },
  {
    id: "c_web_1",
    type: "CODE",
    icon: "globe",
    label: "Clamp Number Into Range",
    cat: "WEB DEV",
    diff: "Easy",
    xp: 60,
    time: "15 min",
    desc: "Utility used by UI layout — clamp a value between min and max.",
    companyTags: ["Meta", "Shopify", "Airbnb"],
    hints: [
      "Return min if value is below min.",
      "Return max if value is above max.",
      "Otherwise return value.",
    ],
    solution: {
      editorial: "Math.max(min, Math.min(max, value)).",
      complexity: "O(1)",
    },
    problem: "clamp(value, min, max) returns the bounded number.",
    examples: "clamp(15, 0, 10) → 10",
    coding: {
      functionName: "clamp",
      starterCode: `function clamp(value, min, max) {\n  \n}\n`,
      examples: [
        { input: "clamp(15, 0, 10)", output: "10" },
        { input: "clamp(-2, 0, 10)", output: "0" },
      ],
      publicTests: [
        { args: [15, 0, 10], expected: 10 },
        { args: [-2, 0, 10], expected: 0 },
        { args: [5, 0, 10], expected: 5 },
      ],
      hiddenTests: [
        { args: [0, 0, 0], expected: 0 },
        { args: [100, 50, 60], expected: 60 },
      ],
    },
  },
  {
    id: "c_graph_1",
    type: "CODE",
    icon: "network",
    label: "BFS Shortest Path Length",
    cat: "DSA",
    diff: "Medium",
    xp: 160,
    time: "40 min",
    desc: "Unweighted shortest path length in an adjacency list graph.",
    companyTags: ["LinkedIn", "Uber", "Microsoft"],
    hints: [
      "BFS queue + visited set.",
      "Track distance layers.",
      "Return -1 if unreachable.",
    ],
    solution: {
      editorial: "Standard BFS; each edge has weight 1.",
      complexity: "Time O(V+E), Space O(V)",
    },
    problem:
      "shortestPath(n, from, to, src, dst) — undirected edges from[i]↔to[i]. Return hops or -1.",
    examples: "n=4, from=[0,1,2], to=[1,2,3], src=0, dst=3 → 3",
    coding: {
      functionName: "shortestPath",
      starterCode: `function shortestPath(n, from, to, src, dst) {\n  \n}\n`,
      examples: [
        {
          input: "n=4, from=[0,1,2], to=[1,2,3], src=0, dst=3",
          output: "3",
        },
      ],
      publicTests: [
        { args: [4, [0, 1, 2], [1, 2, 3], 0, 3], expected: 3 },
        { args: [3, [0, 1], [1, 2], 0, 2], expected: 2 },
        { args: [2, [], [], 0, 1], expected: -1 },
      ],
      hiddenTests: [
        { args: [1, [], [], 0, 0], expected: 0 },
        { args: [5, [0, 0, 2, 3], [1, 2, 3, 4], 0, 4], expected: 3 },
      ],
    },
  },
  {
    id: "t_mcq_1",
    type: "MCQ",
    icon: "book",
    label: "OSI Layers & Networking Fundamentals",
    cat: "THEORY",
    diff: "Medium",
    xp: 120,
    time: "7 min",
    desc: "TCP, UDP, TLS, HTTP/2 multiplexing, and subnetting.",
    companyTags: ["Cisco", "Amazon", "Oracle"],
    hints: ["Layer 4 is transport.", "TLS 1.3 reduces handshake RTTs."],
    solution: {
      editorial:
        "Transport = TCP/UDP. Reliability/order = TCP. Multiplexing without HOL = HTTP/2 streams / QUIC. TLS 1.3 cuts handshake RTT. /24 → 255.255.255.0.",
      complexity: "MCQ answer key",
    },
    questions: [
      {
        id: 1,
        q: "Which OSI layer is TCP?",
        opts: ["Network", "Transport", "Session", "Data Link"],
        correct: 1,
        explanation: "TCP is a transport-layer (L4) protocol providing reliable, ordered byte streams.",
      },
      {
        id: 2,
        q: "UDP does NOT guarantee:",
        opts: ["IP addressing", "In-order delivery & ACKs", "Port multiplexing", "Checksums"],
        correct: 1,
        explanation: "UDP is connectionless: no ACKs, no retransmission, no ordering guarantees.",
      },
      {
        id: 3,
        q: "HTTP/2–3 fix for HOL blocking?",
        opts: ["SSR", "Stream multiplexing / QUIC", "Base64 images", "Long polling"],
        correct: 1,
        explanation: "HTTP/2 multiplexes streams; HTTP/3/QUIC removes TCP HOL blocking at the transport layer.",
      },
      {
        id: 4,
        q: "TLS 1.3 main handshake win?",
        opts: ["1-RTT (or 0-RTT resume)", "HTTP/1 fallback", "Disable ECC", "8192-bit RSA"],
        correct: 0,
        explanation: "TLS 1.3 reduces the handshake to 1-RTT, with optional 0-RTT on session resume.",
      },
      {
        id: 5,
        q: "Subnet mask for /24?",
        opts: ["255.255.0.0", "255.255.255.0", "255.255.255.128", "255.0.0.0"],
        correct: 1,
        explanation: "/24 means 24 network bits → 255.255.255.0.",
      },
    ],
  },
  {
    id: "t_mcq_2",
    type: "MCQ",
    icon: "cpu",
    label: "System Design CAP & Distributed Systems",
    cat: "THEORY",
    diff: "Medium",
    xp: 140,
    time: "7 min",
    desc: "CAP theorem, consistent hashing, WAL, and Redis locks.",
    companyTags: ["Amazon", "Netflix", "Databricks"],
    hints: ["Under partition you choose C or A.", "WAL is about durability."],
    solution: {
      editorial:
        "Under partition you pick Consistency or Availability. Consistent hashing remaps only neighbors. WAL = durability before page writes. At-least-once needs idempotent handlers.",
      complexity: "MCQ answer key",
    },
    questions: [
      {
        id: 1,
        q: "Under partition, Availability sacrifices:",
        opts: ["Latency", "Consistency", "Durability", "Scalability"],
        correct: 1,
        explanation: "CAP: if the network partitions, staying available means you may serve stale/divergent data.",
      },
      {
        id: 2,
        q: "Consistent hashing remap cost when adding a node?",
        opts: ["Rehash all keys", "Only adjacent keys", "Shut down nodes", "SQL keys"],
        correct: 1,
        explanation: "Only keys in the range next to the new node move — O(K/N) expected, not a full rehash.",
      },
      {
        id: 3,
        q: "Purpose of WAL?",
        opts: ["HTTP analytics", "Durability before data page writes", "Password encryption", "CSS compress"],
        correct: 1,
        explanation: "Write-ahead log records changes before applying them so crash recovery can replay.",
      },
      {
        id: 4,
        q: "At-least-once delivery requires:",
        opts: ["At-most-once", "Idempotent handlers", "Exactly-once local", "Zero-copy"],
        correct: 1,
        explanation: "Duplicates can arrive; consumers must be safe to process the same message more than once.",
      },
    ],
  },
  {
    id: "t_mcq_3",
    type: "MCQ",
    icon: "database",
    label: "DBMS Normalization & Indexing",
    cat: "THEORY",
    diff: "Medium",
    xp: 130,
    time: "7 min",
    desc: "3NF, B+ Trees, isolation levels, connection pooling.",
    companyTags: ["Oracle", "Snowflake", "Meta"],
    hints: ["3NF removes transitive deps.", "B+ trees keep data in leaves."],
    solution: {
      editorial:
        "3NF removes transitive dependencies. B+ trees maximize fan-out on disk. Composite indexes need leftmost-prefix filters. Connection poolers like PgBouncer reuse DB sockets.",
      complexity: "MCQ answer key",
    },
    questions: [
      {
        id: 1,
        q: "3NF forbids:",
        opts: ["Partial deps", "Transitive deps", "Multivalued deps", "Composite keys"],
        correct: 1,
        explanation: "3NF: non-key attributes must depend only on the whole key — no transitive deps through other non-keys.",
      },
      {
        id: 2,
        q: "Why B+ Trees for disk indexes?",
        opts: ["High fan-out / fewer I/Os", "String-only nodes", "O(N²) memory", "Unsorted leaves"],
        correct: 0,
        explanation: "Wide nodes mean fewer levels → fewer disk seeks for point and range lookups.",
      },
      {
        id: 3,
        q: "Composite index best when:",
        opts: ["Leftmost prefix filters", "Random tables", "Text files", "DELETE only"],
        correct: 0,
        explanation: "An index on (a,b,c) helps filters that include a, or a+b, or a+b+c — the leftmost prefix rule.",
      },
      {
        id: 4,
        q: "PgBouncer helps by:",
        opts: ["Pooling DB sockets", "Running JS", "Formatting JSON", "SSL generation"],
        correct: 0,
        explanation: "It multiplexes many app connections onto fewer Postgres backends.",
      },
    ],
  },
  {
    id: "p_task_1",
    type: "PROJECT",
    icon: "wrench",
    label: "Build a CLI Memory Uploader",
    cat: "PROJECT",
    diff: "Medium",
    xp: 200,
    time: "1 hr",
    desc: "Python CLI that hashes markdown notes and writes a JSON memory index.",
    companyTags: ["Notion", "GitHub"],
    weeklyBossEligible: true,
    hints: [
      "Use hashlib.sha256 on file bytes.",
      "Write a deterministic JSON index.",
      "Idempotent re-runs should not duplicate entries.",
    ],
    solution: {
      editorial:
        "Hash file bytes with SHA-256, upsert by path into a JSON index, write atomically, and print a short changelog. Re-runs with unchanged content should be no-ops.",
      complexity: "O(bytes) I/O bound",
      notes: "Prefer tempfile + os.replace for atomic writes.",
    },
    problem: "Create mem_sync.py that hashes files and writes a JSON memory index.",
    examples: `$ python mem_sync.py add notes.md\nIngested notes.md`,
    testCases: [
      { id: 1, name: "Hash", input: "sync_memory_file('notes.md')", expected: "SHA-256 hex" },
    ],
    project: {
      type: "project",
      passScore: 70,
      timeLimitMinutes: 90,
      overview: {
        goal: "Build a Python CLI that hashes markdown notes and maintains a JSON memory index with idempotent upserts.",
        stack: ["Python 3", "hashlib", "JSON", "Git"],
        deliverables: [
          "mem_sync.py CLI entrypoint",
          "JSON memory index file",
          "README with usage examples",
        ],
        estimatedHours: 2,
      },
      steps: [
        {
          id: "scaffold",
          title: "Scaffold the CLI",
          instructions:
            "Create a Python project with mem_sync.py, argparse (or click), and a README. Support a command like: python mem_sync.py add <path>.",
          acceptance: [
            "CLI runs without crashing",
            "Help text shows add command",
            "Repo initialized with README",
          ],
          requiredEvidence: ["repo_url", "notes"],
          resources: [
            {
              label: "Python argparse",
              url: "https://docs.python.org/3/library/argparse.html",
            },
          ],
        },
        {
          id: "hash",
          title: "Hash file contents",
          instructions:
            "Read file bytes and compute SHA-256 hex digests. Store path, hash, and timestamp in memory.",
          acceptance: [
            "SHA-256 hex produced for a sample markdown file",
            "Same content yields the same hash",
          ],
          requiredEvidence: ["screenshot_url"],
        },
        {
          id: "index",
          title: "Persist JSON index",
          instructions:
            "Write a deterministic JSON index (sorted keys). Upsert by path. Re-running on unchanged files must not duplicate entries.",
          acceptance: [
            "Index file written",
            "Idempotent re-run",
            "Atomic write preferred",
          ],
          requiredEvidence: ["demo_url"],
        },
        {
          id: "ship",
          title: "Document and ship",
          instructions:
            "Finish README (install, usage, sample output). Push to GitHub and write a short reflection on design choices.",
          acceptance: [
            "README complete",
            "Public or shareable repo",
            "Reflection mentions hashing and idempotency",
          ],
          requiredEvidence: ["repo_url", "notes"],
        },
      ],
      rubric: [
        {
          id: "checklist",
          label: "All guide steps completed",
          weight: 30,
          check: "checklist_complete",
        },
        {
          id: "evidence",
          label: "Required evidence submitted",
          weight: 25,
          check: "evidence_present",
        },
        {
          id: "reflection",
          label: "Reflection covers hashing and idempotency",
          weight: 15,
          check: "keyword_notes",
          keywords: ["hash", "sha", "json", "idempotent", "index", "cli"],
        },
        {
          id: "gh_readme",
          label: "GitHub README present",
          weight: 15,
          check: "github_readme",
        },
        {
          id: "gh_structure",
          label: "Repo contains Python entrypoint",
          weight: 15,
          check: "github_structure",
          requiredPaths: [".py", "readme"],
        },
      ],
    },
  },
  {
    id: "c_dp_1",
    type: "CODE",
    icon: "code",
    label: "Climbing Stairs (DP)",
    cat: "DSA",
    diff: "Easy",
    xp: 70,
    time: "20 min",
    desc: "Count ways to climb n stairs taking 1 or 2 steps.",
    companyTags: ["Amazon", "Adobe"],
    hints: ["dp[i] = dp[i-1] + dp[i-2]", "Base cases: 1 and 2."],
    solution: {
      editorial: "Classic Fibonacci recurrence with bottom-up DP.",
      complexity: "Time O(n), Space O(1)",
    },
    problem: "climbStairs(n) → number of distinct ways.",
    examples: "n=3 → 3",
    coding: {
      functionName: "climbStairs",
      starterCode: `function climbStairs(n) {\n  \n}\n`,
      examples: [
        { input: "n = 2", output: "2" },
        { input: "n = 3", output: "3" },
      ],
      publicTests: [
        { args: [2], expected: 2 },
        { args: [3], expected: 3 },
        { args: [1], expected: 1 },
      ],
      hiddenTests: [
        { args: [5], expected: 8 },
        { args: [10], expected: 89 },
      ],
    },
  },
];

function toQuestion(raw: RawChallenge): ChallengeQuestion {
  const type = mapType(raw.type);
  return {
    id: raw.id,
    type,
    difficulty: mapDiff(raw.diff),
    title: raw.label,
    description: raw.desc,
    topics: topicsFor(raw.cat, raw.label),
    careerTags: careerTagsFor(raw.cat, type),
    companyTags: raw.companyTags || [],
    hints: raw.hints || [],
    solution: raw.solution,
    xp: raw.xp,
    coins: raw.coins ?? Math.max(2, Math.floor(raw.xp / 10)),
    estMinutes: parseMinutes(raw.time),
    icon: raw.icon,
    category: raw.cat,
    prompt: raw.problem || raw.desc,
    examples: raw.examples,
    starterCode: raw.coding?.starterCode,
    coding: raw.coding,
    project: raw.project,
    testCases: raw.testCases,
    questions: raw.questions,
    weeklyBossEligible: raw.weeklyBossEligible,
    legacyType: raw.type,
  };
}

export const CHALLENGE_CATALOG: ChallengeQuestion[] = RAW.map(toQuestion);

export function getChallengeById(id: string): ChallengeQuestion | undefined {
  return CHALLENGE_CATALOG.find((q) => q.id === id);
}

export function listCatalog(): ChallengeQuestion[] {
  return CHALLENGE_CATALOG;
}

export function listCompanies(): string[] {
  return [
    ...new Set(CHALLENGE_CATALOG.flatMap((q) => q.companyTags)),
  ].sort();
}

/** Shape expected by existing Pro IDE / MCQ panels. */
export function toLegacyRunnerPayload(q: ChallengeQuestion) {
  return {
    id: q.id,
    type: q.legacyType,
    icon: q.icon,
    label: q.title,
    cat: q.category,
    diff:
      q.difficulty === "easy"
        ? "Easy"
        : q.difficulty === "hard"
          ? q.legacyType === "MILESTONE"
            ? "Milestone"
            : "Hard"
          : "Medium",
    xp: q.xp,
    coins: q.coins,
    time: `${q.estMinutes} min`,
    desc: q.description,
    problem: q.prompt,
    examples: q.examples,
    code: "",
    coding: q.coding,
    testCases: q.testCases,
    questions: q.questions,
    hints: q.hints,
    solution: q.solution,
    pct: 0,
    done: false,
  };
}

export const DIFF_STYLES = {
  easy: { bg: "rgba(31, 107, 72, 0.12)", bdr: "#1f6b48", col: "#1f6b48", label: "Easy" },
  medium: { bg: "rgba(245, 158, 11, 0.12)", bdr: "#f59e0b", col: "#f59e0b", label: "Medium" },
  hard: { bg: "rgba(236, 72, 153, 0.12)", bdr: "#ec4899", col: "#ec4899", label: "Hard" },
} as const;

export const CAT_COLORS: Record<string, string> = {
  DSA: "#1b4540",
  "SYSTEM DESIGN": "#38bdf8",
  "WEB DEV": "#1f6b48",
  OS: "#ec4899",
  DBMS: "#10b981",
  THEORY: "#c45c26",
  PROJECT: "#f59e0b",
};
