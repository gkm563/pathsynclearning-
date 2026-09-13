import type { RoadmapNodeResource } from "@/types/roadmap";

export type CuratedResource = RoadmapNodeResource & { channel?: string };

export type ResourcePack = {
  id: string;
  match: RegExp;
  resources: CuratedResource[];
};

/** Known-public, long-lived educational videos/docs from distinct channels. */
export const RESOURCE_PACKS: ResourcePack[] = [
  {
    id: "html-css",
    match: /\b(html|css|web fundamentals|responsive)\b/,
    resources: [
      { title: "HTML Full Course", url: "https://www.youtube.com/watch?v=pQN-pnXCaVM", type: "video", channel: "freeCodeCamp" },
      { title: "CSS Crash Course", url: "https://www.youtube.com/watch?v=yfoY53QXEnI", type: "video", channel: "Traversy Media" },
      { title: "CSS — Kevin Powell", url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc", type: "video", channel: "Kevin Powell" },
      { title: "MDN HTML", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "documentation", channel: "MDN" },
    ],
  },
  {
    id: "javascript",
    match: /\b(javascript|js fundamentals|es6)\b/,
    resources: [
      { title: "JavaScript Crash Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", type: "video", channel: "Traversy Media" },
      { title: "JS Full Course", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "video", channel: "freeCodeCamp" },
      { title: "JS in 100 Seconds", url: "https://www.youtube.com/watch?v=DHjqpvDnNGE", type: "video", channel: "Fireship" },
      { title: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "documentation", channel: "MDN" },
      { title: "JavaScript.info", url: "https://javascript.info/", type: "article", channel: "javascript.info" },
    ],
  },
  {
    id: "typescript",
    match: /\b(typescript|ts )\b/,
    resources: [
      { title: "TypeScript Course", url: "https://www.youtube.com/watch?v=30LWjhZzg50", type: "video", channel: "freeCodeCamp" },
      { title: "TS in 100 Seconds", url: "https://www.youtube.com/watch?v=zQnBQ4tB3ZA", type: "video", channel: "Fireship" },
      { title: "Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "documentation", channel: "TypeScript" },
    ],
  },
  {
    id: "react",
    match: /\b(react|next\.js|nextjs)\b/,
    resources: [
      { title: "React Course", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", type: "video", channel: "freeCodeCamp / Bob Ziroll" },
      { title: "React in 100 Seconds", url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", type: "video", channel: "Fireship" },
      { title: "React Docs", url: "https://react.dev/learn", type: "documentation", channel: "React" },
      { title: "Next.js Learn", url: "https://nextjs.org/learn", type: "course", channel: "Vercel" },
    ],
  },
  {
    id: "node",
    match: /\b(node\.js|nodejs|express|backend api)\b/,
    resources: [
      { title: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", type: "video", channel: "Traversy Media" },
      { title: "APIs for Beginners", url: "https://www.youtube.com/watch?v=GZvSYJDk-us", type: "video", channel: "freeCodeCamp" },
      { title: "Node.js Docs", url: "https://nodejs.org/en/learn", type: "documentation", channel: "Node.js" },
    ],
  },
  {
    id: "sql",
    match: /\b(sql|postgres|mysql|database)\b/,
    resources: [
      { title: "SQL Course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", type: "video", channel: "freeCodeCamp" },
      { title: "PostgreSQL Tutorial", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", type: "video", channel: "freeCodeCamp" },
      { title: "Select Star SQL", url: "https://selectstarsql.com/", type: "practice", channel: "Select Star SQL" },
      { title: "Use The Index, Luke", url: "https://use-the-index-luke.com/", type: "article", channel: "Use The Index Luke" },
    ],
  },
  {
    id: "dsa",
    match: /\b(dsa|data structures?|leetcode|neetcode|linked lists?|hash maps?|dynamic programming|big[\s-]?o|arrays and hashing)\b/,
    resources: [
      { title: "DSA Easy to Advanced", url: "https://www.youtube.com/watch?v=RBSGKlAvoiM", type: "video", channel: "freeCodeCamp / William Fiset" },
      { title: "NeetCode roadmap intro", url: "https://www.youtube.com/watch?v=8hly31x25fI", type: "video", channel: "freeCodeCamp" },
      { title: "Abdul Bari Algorithms", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", type: "video", channel: "Abdul Bari" },
      { title: "NeetCode practice", url: "https://neetcode.io/practice", type: "practice", channel: "NeetCode" },
      { title: "LeetCode", url: "https://leetcode.com/problemset/", type: "practice", channel: "LeetCode" },
    ],
  },
  {
    id: "system-design",
    match: /\b(system design|distributed|scalability|microservices)\b/,
    resources: [
      { title: "System Design Primer talk", url: "https://www.youtube.com/watch?v=UzLMhqg3_Wc", type: "video", channel: "InfoQ / Gaurav Sen style" },
      { title: "ByteByteGo intro", url: "https://www.youtube.com/watch?v=xpDnVSmNFX0", type: "video", channel: "ByteByteGo" },
      { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "article", channel: "GitHub" },
    ],
  },
  {
    id: "git",
    match: /\b(git|github|version control)\b/,
    resources: [
      { title: "Git & GitHub Crash Course", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "video", channel: "freeCodeCamp" },
      { title: "Git in 100 Seconds", url: "https://www.youtube.com/watch?v=hwP7WQkmECE", type: "video", channel: "Fireship" },
      { title: "Pro Git", url: "https://git-scm.com/book/en/v2", type: "documentation", channel: "git-scm" },
    ],
  },
  {
    id: "python",
    match: /\b(python)\b/,
    resources: [
      { title: "Python for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", type: "video", channel: "Programming with Mosh" },
      { title: "Python Course", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "video", channel: "freeCodeCamp" },
      { title: "Python docs", url: "https://docs.python.org/3/tutorial/", type: "documentation", channel: "python.org" },
    ],
  },
  {
    id: "ml",
    match: /\b(machine learning|deep learning|neural|pytorch|tensorflow|llm|ml )\b/,
    resources: [
      { title: "ML Course — StatQuest", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI", type: "video", channel: "StatQuest" },
      { title: "3Blue1Brown Neural Nets", url: "https://www.youtube.com/watch?v=aircAruvnKk", type: "video", channel: "3Blue1Brown" },
      { title: "fast.ai Practical DL", url: "https://course.fast.ai/", type: "course", channel: "fast.ai" },
      { title: "Made With ML", url: "https://madewithml.com/", type: "article", channel: "Made With ML" },
    ],
  },
  {
    id: "docker-k8s",
    match: /\b(docker|kubernetes|k8s|containers|devops)\b/,
    resources: [
      { title: "Docker Tutorial", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", type: "video", channel: "TechWorld with Nana" },
      { title: "Kubernetes Course", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", type: "video", channel: "TechWorld with Nana" },
      { title: "Docker docs", url: "https://docs.docker.com/get-started/", type: "documentation", channel: "Docker" },
    ],
  },
  {
    id: "linux",
    match: /\b(linux|bash|shell|unix)\b/,
    resources: [
      { title: "Linux for Hackers / beginners", url: "https://www.youtube.com/watch?v=sWbUDq4S6Y8", type: "video", channel: "NetworkChuck" },
      { title: "Linux Journey", url: "https://linuxjourney.com/", type: "course", channel: "Linux Journey" },
    ],
  },
  {
    id: "crypto",
    match: /\b(crypto(?:graphy)?|encryption|aes|rsa|public[- ]key|hash functions?|sha-?\d*|hmac|diffie[- ]hellman)\b/,
    resources: [
      { title: "Cryptography — Crash Course Computer Science #33", url: "https://www.youtube.com/watch?v=jhXCTbFnK8o", type: "video", channel: "CrashCourse" },
      { title: "Hashing Algorithms and Security", url: "https://www.youtube.com/watch?v=b4b8ktEV4Bg", type: "video", channel: "Computerphile" },
      { title: "SHA: Secure Hashing Algorithm", url: "https://www.youtube.com/watch?v=DMtFhACPnTY", type: "video", channel: "Computerphile" },
      { title: "CryptoHack — Interactive Challenges", url: "https://cryptohack.org/", type: "practice", channel: "CryptoHack" },
    ],
  },
  {
    id: "networking",
    match: /\b(osi|tcp\/?ip|network(?:ing)? fundamentals|sockets?|dns resolver|http protocol)\b/,
    resources: [
      { title: "HTTP Crash Course", url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0", type: "video", channel: "Traversy Media" },
      { title: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", type: "documentation", channel: "MDN" },
    ],
  },
  {
    id: "security",
    match: /\b(security|cybersecurity|owasp|appsec|pentest)\b/,
    resources: [
      { title: "Cybersecurity Course", url: "https://www.youtube.com/watch?v=U_P23SqJaDc", type: "video", channel: "freeCodeCamp" },
      { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "documentation", channel: "OWASP" },
    ],
  },
  {
    id: "java",
    match: /\b(java|spring boot|jvm)\b/,
    resources: [
      { title: "Java Full Course", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo", type: "video", channel: "Bro Code" },
      { title: "Spring Boot", url: "https://www.youtube.com/watch?v=9SGDpanrc8U", type: "video", channel: "freeCodeCamp" },
      { title: "Baeldung", url: "https://www.baeldung.com/get-started-with-spring-boot", type: "article", channel: "Baeldung" },
    ],
  },
  {
    id: "behavioral",
    match: /\b(behavioral|leadership principles|star method|interview prep|mock interview)\b/,
    resources: [
      { title: "STAR method", url: "https://www.youtube.com/watch?v=ba1rQytkHGE", type: "video", channel: "The Org" },
      { title: "Amazon LP overview", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", type: "article", channel: "Amazon Jobs" },
    ],
  },
];

export function packsForText(text: string): ResourcePack[] {
  const hay = text.toLowerCase();
  const scored = RESOURCE_PACKS.map((pack) => {
    const m = hay.match(pack.match);
    return m ? { pack, score: m[0].length } : null;
  }).filter((row): row is { pack: ResourcePack; score: number } => Boolean(row));
  scored.sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const best = scored[0].score;
  return scored.filter((row) => row.score >= best * 0.65).slice(0, 2).map((row) => row.pack);
}

export function curatedResourcesForNode(title: string, extra = ""): CuratedResource[] {
  const packs = packsForText(`${title} ${extra}`);
  const out: CuratedResource[] = [];
  const seen = new Set<string>();
  for (const pack of packs) {
    for (const r of pack.resources) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      out.push(r);
    }
  }
  return out;
}
