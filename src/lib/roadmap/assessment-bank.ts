import type { NodeAssessment, RoadmapNode } from "@/types/roadmap";
import { ASSESSABLE_NODE_TYPES } from "@/lib/roadmap/assessment";
import {
  buildProjectSpecForNode,
  nodeAssessmentFromProjectSpec,
} from "@/lib/projects/specs";

type TopicPack = {
  id: string;
  match: RegExp;
  youtube: { title: string; url: string };
  preferCoding: boolean;
  mcq: (node: RoadmapNode) => NodeAssessment["mcq"];
  coding?: (node: RoadmapNode) => NonNullable<NodeAssessment["coding"]>;
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
    coding: () => ({
      prompt:
        "Implement `twoSum(nums, target)` that returns indices of two numbers that add up to `target`. Exactly one solution exists. Use a hash map for O(n) time.",
      starterCode: `function twoSum(nums, target) {\n  // return [i, j]\n  \n}\n`,
      functionName: "twoSum",
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
    }),
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
    coding: () => ({
      prompt:
        "Implement `isPalindrome(s)` that returns true if `s` reads the same forwards and backwards. Ignore case; consider only alphanumeric characters.",
      starterCode: `function isPalindrome(s) {\n  // return true/false\n  \n}\n`,
      functionName: "isPalindrome",
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
        { input: 's = "race a car"', output: "false" },
      ],
      publicTests: [
        { args: ["A man, a plan, a canal: Panama"], expected: true },
        { args: ["race a car"], expected: false },
      ],
      hiddenTests: [
        { args: [" "], expected: true },
        { args: ["0P"], expected: false },
      ],
    }),
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
    coding: () => ({
      prompt:
        "Implement `binarySearch(nums, target)` on a sorted ascending array. Return the index of `target`, or -1 if missing.",
      starterCode: `function binarySearch(nums, target) {\n  // return index or -1\n  \n}\n`,
      functionName: "binarySearch",
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      ],
      publicTests: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      ],
      hiddenTests: [
        { args: [[5], 5], expected: 0 },
        { args: [[1, 2, 3], 1], expected: 0 },
      ],
    }),
  },
  {
    id: "trees-graphs",
    match: /\b(tree|trees|bst|binary\s*tree|graph|graphs|dfs|bfs|heap)\b/,
    youtube: {
      title: "Tree & Graph Algorithms — freeCodeCamp",
      url: "https://www.youtube.com/watch?v=tWVWeAqas0k",
    },
    preferCoding: false,
    mcq: (node) => ({
      questions: [
        q(node, 1, `In ${node.title}, BFS typically uses which structure?`, ["Stack", "Queue", "Only recursion", "Hash set only"], 1),
        q(node, 2, "DFS is naturally implemented with…", ["Queue", "Stack or recursion", "Priority queue only", "Bloom filter"], 1),
        q(node, 3, "A binary search tree property is…", ["All nodes have 3 children", "Left < node < right (usual BST)", "Nodes are unsorted", "Only leaves store values"], 1),
        q(node, 4, "Detecting a cycle in a directed graph often uses…", ["Counting sort", "DFS colors / recursion stack", "Binary search", "Two pointers on an array"], 1),
      ],
    }),
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
    coding: () => ({
      prompt:
        "Implement `sumUnique(nums)` that returns the sum of elements that appear exactly once in `nums`.",
      starterCode: `function sumUnique(nums) {\n  // return number\n  \n}\n`,
      functionName: "sumUnique",
      examples: [
        { input: "nums = [1,2,3,2]", output: "4" },
        { input: "nums = [1,1,1,1]", output: "0" },
      ],
      publicTests: [
        { args: [[1, 2, 3, 2]], expected: 4 },
        { args: [[1, 1, 1, 1]], expected: 0 },
      ],
      hiddenTests: [
        { args: [[1, 2, 3, 4]], expected: 10 },
        { args: [[5, 5, 6]], expected: 6 },
      ],
    }),
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
    match: /\b(http|https|rest|api|tcp|udp|network|dns|cors|websocket)\b/,
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
    id: "algorithms-general",
    match: /\b(algorithm|dsa|complexity|big[\s-]?o|leetcode|problem[- ]solving|dynamic\s*programming|recursion)\b/,
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
    coding: () => ({
      prompt:
        "Implement `maxSubArray(nums)` (Kadane) returning the largest sum of any contiguous subarray.",
      starterCode: `function maxSubArray(nums) {\n  // return max sum\n  \n}\n`,
      functionName: "maxSubArray",
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
        { input: "nums = [1]", output: "1" },
      ],
      publicTests: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[1]], expected: 1 },
      ],
      hiddenTests: [
        { args: [[5, 4, -1, 7, 8]], expected: 23 },
        { args: [[-1]], expected: -1 },
      ],
    }),
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
  let best: TopicPack | null = null;
  let bestScore = 0;
  for (const pack of PACKS) {
    const m = hay.match(pack.match);
    if (!m) continue;
    const score = m[0].length + (hay.includes(pack.id.split("-")[0]) ? 2 : 0);
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
  if (node.type === "project") {
    return nodeAssessmentFromProjectSpec(buildProjectSpecForNode(node));
  }

  const pack = pickPack(node);
  const coding = wantsCoding(node, pack);

  if (coding && pack?.coding) {
    return {
      type: "coding",
      passScore: 100,
      timeLimitMinutes: 45,
      coding: pack.coding(node),
    };
  }

  return {
    type: "mcq",
    passScore: 70,
    timeLimitMinutes: 20,
    mcq: pack?.mcq(node) || fallbackMcq(node),
  };
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
  return {
    title: "Data Structures Easy to Advanced — freeCodeCamp",
    url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
  };
}

/** Attach / repair assessment + YouTube so they match node learning content. */
export function ensureNodeAssessments(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.map((node) => {
    if (!ASSESSABLE_NODE_TYPES.includes(node.type)) return node;

    const yt = pickYt(node);
    const resources = [...(node.resources || [])];
    const hasYt = resources.some(
      (r) => r.type === "video" && /youtube\.com|youtu\.be/i.test(r.url || ""),
    );
    if (!hasYt) {
      resources.unshift({
        title: yt.title,
        url: yt.url,
        type: "video",
      });
    }

    let assessment = node.assessment;
    if (!assessment || isMisalignedAssessment(node, assessment)) {
      assessment = buildAssessmentForNode(node);
    }

    return { ...node, resources, assessment };
  });
}
