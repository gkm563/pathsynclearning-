import type { NodeAssessment, RoadmapNode } from "@/types/roadmap";
import { ASSESSABLE_NODE_TYPES } from "@/lib/roadmap/assessment";
import {
  buildProjectSpecForNode,
  nodeAssessmentFromProjectSpec,
} from "@/lib/projects/specs";
import { curatedResourcesForNode } from "@/lib/roadmap/resource-library";
import { isVideoOnTopic } from "@/lib/roadmap/video-recommend";
import {
  BINARY_SEARCH,
  CLIMB_STAIRS,
  CONTAINS_DUPLICATE,
  hydrateCodingAssessment,
  IS_ANAGRAM,
  IS_PALINDROME,
  MAX_DEPTH,
  MAX_SUB_ARRAY,
  SUM_UNIQUE,
  TWO_SUM,
} from "@/lib/roadmap/coding-problems";
import type { CodingAssessment } from "@/types/roadmap";

type TopicPack = {
  id: string;
  match: RegExp;
  youtube: { title: string; url: string };
  preferCoding: boolean;
  mcq: (node: RoadmapNode) => NodeAssessment["mcq"];
  coding?: (node: RoadmapNode) => CodingAssessment;
  extraCoding?: (node: RoadmapNode) => CodingAssessment;
};

function ctx(node: RoadmapNode): string {
  return [
    node.title,
    node.description,
    node.whyLearn,
    ...(node.skills || []),
    ...(node.topics || []),
    node.project || "",
  ]
    .join(" ")
    .toLowerCase();
}

function q(
  node: RoadmapNode,
  i: number,
  prompt: string,
  options: string[],
  correctIndex: number,
) {
  return {
    id: `${node.id}-q${i}`,
    prompt,
    options,
    correctIndex,
  };
}

function hashSeed(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function shuffle<T>(items: T[], seed: number): T[] {
  const next = [...items];
  let s = seed || 1;
  for (let i = next.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function labelsOf(node: RoadmapNode): string[] {
  const subtopics = (node.subtopics || []).map((item) =>
    typeof item === "string" ? item : item.title,
  );
  return [...subtopics, ...(node.topics || []), ...(node.skills || [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function choiceQuestion(
  node: RoadmapNode,
  i: number,
  prompt: string,
  correct: string,
  pool: string[],
) {
  const filler = [
    "Unrelated trivia",
    "Skipping this topic",
    "Memorizing without practice",
    "Avoiding examples",
  ];
  const options: string[] = [];
  for (const item of [correct, ...pool, ...filler]) {
    const text = String(item || "").trim();
    if (!text) continue;
    if (options.some((row) => row.toLowerCase() === text.toLowerCase())) continue;
    options.push(text);
    if (options.length >= 4) break;
  }
  while (options.length < 4) options.push(`Not a focus of this module (${options.length + 1})`);
  const shuffled = shuffle(options.slice(0, 4), hashSeed(`${node.id}-${i}-${prompt}`));
  return q(node, i, prompt, shuffled, shuffled.findIndex((row) => row === correct));
}

function expandMcqQuestions(
  node: RoadmapNode,
  seed: NonNullable<NodeAssessment["mcq"]>["questions"] = [],
): NonNullable<NodeAssessment["mcq"]>["questions"] {
  const out: NonNullable<NodeAssessment["mcq"]>["questions"] = [];
  const seen = new Set<string>();
  const push = (item: (typeof out)[number]) => {
    const key = item.prompt.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ ...item, id: `${node.id}-q${out.length + 1}` });
  };

  for (const item of seed) push(item);

  const pool = labelsOf(node);
  const outcomes = (node.learningOutcomes || [])
    .map((row) => String(row || "").trim())
    .filter(Boolean);

  for (const title of [...new Set(pool)]) {
    push(
      choiceQuestion(
        node,
        out.length + 1,
        `In “${node.title}”, what should you cover under “${title}”?`,
        `It is part of this module — study ${title}`,
        [
          "Skip it; it is optional trivia",
          "Replace it with unrelated interview riddles",
          "Ignore it until after the final interview",
        ],
      ),
    );
  }

  for (const outcome of outcomes) {
    const label = outcome.length > 180 ? `${outcome.slice(0, 177)}…` : outcome;
    push(
      choiceQuestion(
        node,
        out.length + 1,
        `After finishing “${node.title}”, which outcome matches: “${label}”?`,
        label,
        outcomes
          .filter((row) => row !== outcome)
          .map((row) => (row.length > 180 ? `${row.slice(0, 177)}…` : row)),
      ),
    );
  }

  if (node.interviewFocus) {
    const focus =
      node.interviewFocus.length > 180
        ? `${node.interviewFocus.slice(0, 177)}…`
        : node.interviewFocus;
    push(
      choiceQuestion(
        node,
        out.length + 1,
        `What do interviewers typically probe for “${node.title}”?`,
        focus,
        pool,
      ),
    );
  }

  if (out.length <= 4) {
    push(
      q(
        node,
        out.length + 1,
        `Best way to practice “${node.title}” beyond reading?`,
        [
          "Work a small example or exercise and check edge cases",
          "Only reread the title",
          "Skip all examples",
          "Memorize unrelated facts",
        ],
        0,
      ),
    );
    push(
      q(
        node,
        out.length + 1,
        `If you are stuck on “${node.title}”, what should you do first?`,
        [
          "Retry a smaller case and name what you do not understand",
          "Skip the module forever",
          "Change career immediately",
          "Ignore the error and move on",
        ],
        0,
      ),
    );
    push(
      q(
        node,
        out.length + 1,
        `Which mistake undermines “${node.title}” the most?`,
        [
          "Treating it as trivia and never applying it",
          "Checking a worked example",
          "Writing down what you learned",
          "Practicing a tiny version first",
        ],
        0,
      ),
    );
  }

  return out;
}

function mcqTimeLimit(questionCount: number, current?: number) {
  return Math.min(180, Math.max(current || 20, Math.ceil(questionCount * 1.5)));
}

const PACKS: TopicPack[] = [
  {
    id: "arrays-hash",
    match: /\b(array|arrays|hash\s*map|hashmap|two\s*sum|sliding\s*window|prefix\s*sum)\b/,
    youtube: {
      title: "Arrays & Hashing — NeetCode",
      url: "https://www.youtube.com/watch?v=3OamzN90kPg",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, what is the average-case lookup time of a hash map?`, ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2),
        q(node, 2, "Why use a hash map for the Two Sum pattern?", ["Slower than nested loops", "Store complements for O(n) lookup", "Sorts the array automatically", "Uses less memory than an array"], 1),
        q(node, 3, "What does a sliding window typically optimize?", ["Graph coloring", "Subarray/substring problems over contiguous ranges", "Sorting integers", "Tree balancing"], 1),
        q(node, 4, "A prefix sum array helps you…", ["Find range sums in O(1) after O(n) prep", "Sort faster", "Hash strings", "Traverse trees"], 0),
      ],
    }),
    coding: () => TWO_SUM,
    extraCoding: () => CONTAINS_DUPLICATE,
  },
  {
    id: "strings",
    match: /\b(string|strings|palindrome|anagram|substring|regex)\b/,
    youtube: {
      title: "String Algorithms — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=q567vi7OD6s",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `For ${node.title}, what is usually the safest way to reverse a string in JS?`, ["str.reverse()", "[...str].reverse().join('')", "str.sort()", "str.split() only"], 1),
        q(node, 2, "An anagram check typically needs…", ["Same characters with same frequencies", "Same length only", "Sorted vowels only", "Matching first letter"], 0),
        q(node, 3, "Two-pointer technique on a string is useful for…", ["Database indexing", "Palindrome / pair checks from both ends", "HTTP caching", "CSS layout"], 1),
        q(node, 4, "Time complexity of building a frequency map of a string of length n is…", ["O(1)", "O(log n)", "O(n)", "O(n²) always"], 2),
      ],
    }),
    coding: () => IS_PALINDROME,
    extraCoding: () => IS_ANAGRAM,
  },
  {
    id: "sorting-search",
    match: /\b(sort|sorting|binary\s*search|searching|merge\s*sort|quick\s*sort)\b/,
    youtube: {
      title: "Sorting Algorithms — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=kPRA0W1kECg",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `Related to ${node.title}: binary search requires the array to be…`, ["Unsorted", "Sorted", "A hash map", "A linked list only"], 1),
        q(node, 2, "Average time complexity of merge sort is…", ["O(n)", "O(n log n)", "O(n²)", "O(1)"], 1),
        q(node, 3, "Binary search worst-case comparisons on n elements is…", ["O(n)", "O(log n)", "O(n²)", "O(1)"], 1),
        q(node, 4, "Stable sorting means…", ["Fastest algorithm", "Equal keys keep relative order", "Uses no memory", "Only works on integers"], 1),
      ],
    }),
    coding: () => BINARY_SEARCH,
  },
  {
    id: "trees-graphs",
    match: /\b(tree|trees|bst|binary\s*tree|graph|graphs|dfs|bfs|heap)\b/,
    youtube: {
      title: "Tree & Graph Algorithms — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=tWVWeAqas0k",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, BFS typically uses which structure?`, ["Stack", "Queue", "Only recursion", "Hash set only"], 1),
        q(node, 2, "DFS is naturally implemented with…", ["Queue", "Stack or recursion", "Priority queue only", "Bloom filter"], 1),
        q(node, 3, "A binary search tree property is…", ["All nodes have 3 children", "Left < node < right (usual BST)", "Nodes are unsorted", "Only leaves store values"], 1),
        q(node, 4, "Detecting a cycle in a directed graph often uses…", ["Counting sort", "DFS colors / recursion stack", "Binary search", "Two pointers on an array"], 1),
      ],
    }),
    coding: () => MAX_DEPTH,
  },
  {
    id: "javascript",
    match: /\b(javascript|typescript|js\b|node\.?js|es6|closure|promise|async)\b/,
    youtube: {
      title: "JavaScript Full Course — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `Regarding ${node.title}: \`===\` compares…`, ["Value only after coercion", "Value and type without coercion", "Only object identity", "Only arrays"], 1),
        q(node, 2, "A closure lets a function…", ["Run only once", "Access outer scope variables after the outer function returns", "Disable garbage collection", "Bypass the event loop"], 1),
        q(node, 3, "`Promise.all` rejects when…", ["Any input promise rejects", "All resolve", "None are async", "You use async/await"], 0),
        q(node, 4, "`const` means the binding…", ["Is immutable for objects deeply", "Cannot be reassigned", "Makes values frozen", "Is function-scoped like var"], 1),
      ],
    }),
    coding: () => SUM_UNIQUE,
  },
  {
    id: "sql-db",
    match: /\b(sql|database|dbms|postgres|mysql|mongodb|query|join|index(?:ing)?|normalization)\b/,
    youtube: {
      title: "SQL Tutorial — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, an INNER JOIN returns…`, ["All rows from both tables", "Only matching rows from both tables", "Only left table rows", "Duplicates only"], 1),
        q(node, 2, "A primary key must be…", ["Nullable and duplicated", "Unique and not null", "Always a string", "Stored in Redis"], 1),
        q(node, 3, "An index mainly helps…", ["Speed up reads/lookups", "Encrypt data", "Replace foreign keys", "Normalize automatically"], 0),
        q(node, 4, "Normalization reduces…", ["Query speed always", "Data redundancy / update anomalies", "Number of tables always to 1", "Need for primary keys"], 1),
      ],
    }),
  },
  {
    id: "html-css",
    match: /\b(html|css|dom|flexbox|grid|responsive|frontend\s*ui|semantic\s*html)\b/,
    youtube: {
      title: "HTML CSS Crash Course — Traversy Media",
      url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `For ${node.title}: \`display: flex\` primarily enables…`, ["Database joins", "One-dimensional layout of children", "TCP connections", "Binary search"], 1),
        q(node, 2, "Semantic HTML improves…", ["Only page colors", "Accessibility and document meaning", "SQL performance", "Git merges"], 1),
        q(node, 3, "CSS specificity: which usually wins?", ["Element selector", "Inline style", "Universal *", "Inherited value always"], 1),
        q(node, 4, "A media query is used to…", ["Call REST APIs", "Apply styles at breakpoints for responsive design", "Hash passwords", "Index tables"], 1),
      ],
    }),
  },
  {
    id: "react",
    match: /\b(react|jsx|hooks|useState|useEffect|redux|next\.?js)\b/,
    youtube: {
      title: "React Course — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, \`useState\` is for…`, ["Server routing", "Local component state", "SQL queries", "CSS modules only"], 1),
        q(node, 2, "`useEffect` runs…", ["Only during SSR", "After render for side effects", "Before JSX parses", "Instead of props"], 1),
        q(node, 3, "Keys in lists help React…", ["Style elements", "Identify items across re-renders", "Call APIs", "Encrypt state"], 1),
        q(node, 4, "Lifting state up means…", ["Moving state to a common parent", "Deleting hooks", "Using only Redux", "Avoiding props"], 0),
      ],
    }),
  },
  {
    id: "oop",
    match: /\b(oop|object[- ]oriented|class|inheritance|polymorphism|encapsulation|abstraction)\b/,
    youtube: {
      title: "OOP in Python — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=JeznW_7DlB0",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, encapsulation mainly means…`, ["Hiding internal state behind an interface", "Using only global variables", "Multiple inheritance required", "Avoiding methods"], 0),
        q(node, 2, "Polymorphism allows…", ["One interface, many implementations", "No classes", "Only static methods", "Faster SQL"], 0),
        q(node, 3, "Inheritance models a…", ["Has-a relationship only", "Is-a relationship", "Network protocol", "CSS cascade"], 1),
        q(node, 4, "Abstraction focuses on…", ["Every low-level bit", "Essential behavior, hiding details", "Deleting interfaces", "Avoiding objects"], 1),
      ],
    }),
  },
  {
    id: "git",
    match: /\b(git|github|version\s*control|commit|branch|merge|pull\s*request)\b/,
    youtube: {
      title: "Git & GitHub — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `For ${node.title}: \`git commit\` records changes in…`, ["Remote only", "Local repository history", "npm cache", "CI secrets"], 1),
        q(node, 2, "A branch is used to…", ["Delete history", "Develop in isolation from main", "Replace remotes", "Compile C++"], 1),
        q(node, 3, "`git merge` combines…", ["Two unrelated databases", "Histories of branches", "CSS files only", "Docker images"], 1),
        q(node, 4, "A pull request is primarily for…", ["Running SQL", "Code review before integrating changes", "Formatting Prettier", "DNS lookup"], 1),
      ],
    }),
  },
  {
    id: "networking-http",
    match: /\b(http|https|rest api|tcp|udp|networking|osi model|dns|cors|websocket)\b/,
    youtube: {
      title: "HTTP Crash Course — Traversy Media",
      url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, HTTP GET should be…`, ["Unsafe and non-idempotent", "Safe and idempotent for reads", "Used only for deletes", "Encrypted by default without TLS"], 1),
        q(node, 2, "Status code 404 means…", ["OK", "Not Found", "Server error", "Redirect"], 1),
        q(node, 3, "REST APIs usually exchange…", ["Only binary blobs", "Resources via HTTP methods/URLs", "SQL tables directly", "CSS only"], 1),
        q(node, 4, "HTTPS adds…", ["Faster sorting", "TLS encryption for confidentiality", "Automatic DB indexes", "Git hooks"], 1),
      ],
    }),
  },
  {
    id: "crypto",
    match: /\b(crypto(?:graphy)?|encryption|aes|rsa|public[- ]key|hash functions?|sha-?\d*|hmac)\b/,
    youtube: {
      title: "Cryptography — Crash Course Computer Science #33",
      url: "https://www.youtube.com/watch?v=jhXCTbFnK8o",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, a cryptographic hash is mainly used to…`, ["Encrypt so you can decrypt later", "Produce a fixed digest that is hard to reverse", "Compress files losslessly", "Replace TLS certificates"], 1),
        q(node, 2, "Symmetric encryption means…", ["Different keys to encrypt and decrypt", "The same secret key encrypts and decrypts", "No keys are needed", "Only hashing is used"], 1),
        q(node, 3, "Public-key cryptography is useful because…", ["You can publish a key used to encrypt without sharing the private key", "It is always faster than AES", "Hashes become reversible", "It removes the need for integrity checks"], 0),
        q(node, 4, "Why not store passwords as plain SHA-1 of the password?", ["Hashes are too slow", "Unsalted fast hashes are easy to crack with rainbow tables/GPUs", "SHA-1 encrypts and can be decrypted", "Browsers reject hashed passwords"], 1),
      ],
    }),
  },
  {
    id: "algorithms-general",
    match: /\b(dsa|data structures?|leetcode|time complexity|big[\s-]?o|dynamic\s*programming|recursion)\b/,
    youtube: {
      title: "Data Structures Easy to Advanced — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
    },
    preferCoding: true,
    mcq: (node) => ({
      questions: [
        q(node, 1, `For ${node.title}, Big-O describes…`, ["Exact runtime in ms", "How time/space grow with input size", "Memory brand", "Git history size"], 1),
        q(node, 2, "O(n²) is typical of…", ["Binary search", "Naive nested loops", "Hash map average lookup", "Constant work"], 1),
        q(node, 3, "Recursion needs…", ["A base case", "No call stack", "Sorted input always", "HTTP/2"], 0),
        q(node, 4, "Space complexity measures…", ["Extra memory vs input size", "Only CPU cores", "Network latency", "Bundle size"], 0),
      ],
    }),
    coding: () => MAX_SUB_ARRAY,
    extraCoding: () => CLIMB_STAIRS,
  },
];

function fallbackMcq(node: RoadmapNode): NodeAssessment["mcq"] {
  const title = node.title || "this topic";
  const skill = (node.skills && node.skills[0]) || title;
  const topic = (node.topics && node.topics[0]) || skill;
  const why = node.whyLearn || node.description || `mastering ${title}`;

  return {
    questions: [
      q(
        node,
        1,
        `What skill does the module “${title}” primarily build?`,
        [
          skill,
          "Unrelated trivia memorization",
          "Avoiding all practice",
          "Deleting prerequisites",
        ],
        0,
      ),
      q(
        node,
        2,
        `Which topic is most central to “${title}”?`,
        [
          topic,
          "Random off-topic facts",
          "Ignoring the learning goal",
          "Skipping examples",
        ],
        0,
      ),
      q(
        node,
        3,
        `Why learn “${title}”?`,
        [
          why.slice(0, 120),
          "It has no practical use",
          "To avoid projects forever",
          "To skip fundamentals",
        ],
        0,
      ),
      q(
        node,
        4,
        `Best way to demonstrate mastery of “${title}”?`,
        [
          "Apply concepts in a small exercise or project tied to this module",
          "Never practice",
          "Only memorize definitions without examples",
          "Ignore the module resources",
        ],
        0,
      ),
    ],
  };
}

function pickPack(node: RoadmapNode): TopicPack | null {
  const hay = ctx(node);
  const title = (node.title || "").toLowerCase();
  let best: TopicPack | null = null;
  let bestScore = 0;
  for (const pack of PACKS) {
    const m = hay.match(pack.match);
    if (!m) continue;
    const inTitle = pack.match.test(title);
    const score = m[0].length * (inTitle ? 4 : 1) + (hay.includes((pack.id || "").split("-")[0]) ? 2 : 0);
    if (score > bestScore) {
      best = pack;
      bestScore = score;
    }
  }
  return best;
}

function wantsCoding(node: RoadmapNode, pack: TopicPack | null): boolean {
  const hay = ctx(node);
  if (node.type === "project") return Boolean(pack?.coding);
  if (pack?.preferCoding && pack.coding) return true;
  return (
    Boolean(pack?.coding) &&
    /\b(code|implement|algorithm|dsa|leet|program|coding)\b/.test(hay)
  );
}

export function buildAssessmentForNode(node: RoadmapNode): NodeAssessment {
  return buildAssessmentsForNode(node)[0];
}

function withIds(node: RoadmapNode, list: NodeAssessment[]): NodeAssessment[] {
  return list.map((a, i) => {
    const coding = a.coding ? hydrateCodingAssessment(a.coding) : a.coding;
    return {
      ...a,
      id: a.id || `${node.id}-${a.type}-${i}`,
      title:
        a.title ||
        coding?.title ||
        (a.type === "mcq"
          ? "Concept quiz"
          : a.type === "project"
            ? "Project submission"
            : coding?.functionName || "Assessment"),
      coding,
    };
  });
}

function codingPart(
  node: RoadmapNode,
  coding: CodingAssessment,
  index: number,
): NodeAssessment {
  const hydrated = hydrateCodingAssessment(coding);
  return {
    id: `${node.id}-coding-${index}`,
    title: hydrated.title || hydrated.functionName,
    type: "coding",
    passScore: 100,
    timeLimitMinutes: 45,
    coding: hydrated,
  };
}

function mcqPart(node: RoadmapNode, mcq: NodeAssessment["mcq"]): NodeAssessment {
  const questions = expandMcqQuestions(node, mcq?.questions || []);
  return {
    id: `${node.id}-mcq-0`,
    title: "Concept quiz",
    type: "mcq",
    passScore: 70,
    timeLimitMinutes: mcqTimeLimit(questions.length, 20),
    mcq: { questions },
  };
}

function wantsMultiple(node: RoadmapNode): boolean {
  if (node.type === "checkpoint") return true;
  if (node.priority === "high" || node.priority === "critical") return true;
  if (node.type === "skill" && /\b(interview|oa|dsa|leet)\b/i.test(ctx(node))) return true;
  return false;
}

export function buildAssessmentsForNode(node: RoadmapNode): NodeAssessment[] {
  if (node.type === "project") {
    const project = nodeAssessmentFromProjectSpec(buildProjectSpecForNode(node));
    return withIds(node, [{ ...project, title: project.title || "Project submission" }]);
  }

  const pack = pickPack(node);
  const codingWanted = wantsCoding(node, pack);
  const list: NodeAssessment[] = [];

  if (codingWanted && pack?.coding) {
    list.push(codingPart(node, pack.coding(node), 0));
  }

  const addMcq = !codingWanted || wantsMultiple(node);
  if (addMcq) {
    list.push(mcqPart(node, pack?.mcq(node) || fallbackMcq(node)));
  }

  if (
    codingWanted &&
    pack?.extraCoding &&
    (node.type === "checkpoint" || node.priority === "critical")
  ) {
    list.push(codingPart(node, pack.extraCoding(node), 1));
  }

  return withIds(node, list);
}

function isMisalignedAssessment(node: RoadmapNode, assessment: NodeAssessment): boolean {
  const hay = ctx(node);

  // Old generic study-habit MCQs
  if (assessment.type === "mcq" && assessment.mcq) {
    const prompts = assessment.mcq.questions.map((q) => q.prompt).join(" ");
    if (
      /primary goal when studying|practice habit best reinforces|Before moving to advanced|When stuck on a .+ problem/i.test(
        prompts,
      )
    ) {
      return true;
    }
  }

  // twoSum / array coding on unrelated modules
  if (assessment.type === "coding" && assessment.coding) {
    const fn = assessment.coding.functionName || "";
    const prompt = assessment.coding.prompt || "";
    if (
      (fn === "twoSum" || /twoSum/i.test(prompt)) &&
      !/\b(array|hash|two\s*sum|dsa|algorithm)\b/.test(hay)
    ) {
      return true;
    }
    // Coding assessment on clearly non-coding conceptual topics
    if (
      /\b(html|css|sql|git|oop theory|http theory|react hooks overview)\b/.test(hay) &&
      !/\b(implement|project|build|code)\b/.test(hay) &&
      node.type !== "project"
    ) {
      // If pack would prefer MCQ, coding is misaligned
      const pack = pickPack(node);
      if (pack && !pack.preferCoding) return true;
    }
  }

  // Project nodes should use project assessments
  if (node.type === "project" && assessment.type !== "project") {
    return true;
  }

  return false;
}

function pickYt(node: RoadmapNode) {
  const pack = pickPack(node);
  if (pack) return pack.youtube;
  const curated = curatedResourcesForNode(
    `${node.title} ${node.skills?.join(" ") || ""} ${node.topics?.join(" ") || ""}`,
  ).find((r) => r.type === "video");
  if (curated) return { title: curated.title, url: curated.url };
  return null;
}

/** Attach / repair assessment + YouTube so they match node learning content. */
export function ensureNodeAssessments(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.map((node) => {
    if (ASSESSABLE_NODE_TYPES.includes(node.type) === false) return node;
    if (node.source === "loop_refresh" || node.source === "remediation") {
      return node;
    }

    const hay = `${node.title} ${node.skills?.join(" ") || ""} ${node.topics?.join(" ") || ""}`;
    const yt = pickYt(node);
    const extras = curatedResourcesForNode(hay);
    const resources = [...(node.resources || [])].filter((r) => {
      if (r.type !== "video") return true;
      return isVideoOnTopic(hay, r.title, r.channel);
    });
    const seen = new Set(resources.map((r) => r.url));
    if (
      yt &&
      !resources.some((r) => r.type === "video" && /youtube\.com|youtu\.be/i.test(r.url || ""))
    ) {
      resources.unshift({ title: yt.title, url: yt.url, type: "video", suggested: false });
      seen.add(yt.url);
    }
    for (const extra of extras) {
      if (seen.has(extra.url) || resources.length >= 8) continue;
      seen.add(extra.url);
      resources.push({ ...extra, suggested: true });
    }

    const existing = [
      ...(Array.isArray(node.assessments) ? node.assessments : []),
    ];
    if (existing.length === 0 && node.assessment) existing.push(node.assessment);

    const misaligned =
      existing.length === 0 ||
      existing.some((a) => isMisalignedAssessment(node, a));
    const tooFew = wantsMultiple(node) && existing.length < 2 && node.type !== "project";

    const assessments = (misaligned || tooFew
      ? buildAssessmentsForNode(node)
      : withIds(
          node,
          existing.map((a) =>
            a.coding ? { ...a, coding: hydrateCodingAssessment(a.coding) } : a,
          ),
        )
    ).map((assessment) => {
      if (assessment.type !== "mcq" || !assessment.mcq) return assessment;
      const questions = expandMcqQuestions(node, assessment.mcq.questions);
      return {
        ...assessment,
        timeLimitMinutes: mcqTimeLimit(questions.length, assessment.timeLimitMinutes),
        mcq: { questions },
      };
    });

    return { ...node, resources, assessment: assessments[0], assessments };
  });
}

