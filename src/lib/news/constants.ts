/** Tech News domain constants. */

export const NEWS_CATEGORIES = [
  "AI",
  "Programming",
  "Startups",
  "Cybersecurity",
  "Web Development",
  "Cloud",
  "Open Source",
  "Gadgets",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const NEWS_SORTS = ["latest", "popular"] as const;
export type NewsSort = (typeof NEWS_SORTS)[number];

/** Dev.to tag → PathEd category. */
export const DEVTO_TAG_CATEGORY: Record<string, NewsCategory> = {
  ai: "AI",
  machinelearning: "AI",
  artificialintelligence: "AI",
  llm: "AI",
  openai: "AI",
  programming: "Programming",
  javascript: "Programming",
  typescript: "Programming",
  python: "Programming",
  java: "Programming",
  coding: "Programming",
  beginners: "Programming",
  startup: "Startups",
  startups: "Startups",
  career: "Startups",
  security: "Cybersecurity",
  cybersecurity: "Cybersecurity",
  infosec: "Cybersecurity",
  webdev: "Web Development",
  react: "Web Development",
  nextjs: "Web Development",
  css: "Web Development",
  frontend: "Web Development",
  node: "Web Development",
  cloud: "Cloud",
  aws: "Cloud",
  azure: "Cloud",
  devops: "Cloud",
  docker: "Cloud",
  kubernetes: "Cloud",
  opensource: "Open Source",
  github: "Open Source",
  git: "Open Source",
  gadgets: "Gadgets",
  hardware: "Gadgets",
  mobile: "Gadgets",
  ios: "Gadgets",
  android: "Gadgets",
};

/** Query terms for optional NewsAPI enrichment per category. */
export const NEWSAPI_CATEGORY_QUERY: Record<NewsCategory, string> = {
  AI: "artificial intelligence OR machine learning OR LLM",
  Programming: "software programming OR coding OR developer",
  Startups: "tech startup OR venture funding",
  Cybersecurity: "cybersecurity OR data breach OR ransomware",
  "Web Development": "web development OR React OR JavaScript framework",
  Cloud: "cloud computing OR AWS OR Kubernetes",
  "Open Source": "open source software OR GitHub",
  Gadgets: "gadgets OR smartphones OR consumer tech",
};

export const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const STALE_CACHE_MAX_MS = 24 * 60 * 60 * 1000; // serve stale up to 24h on upstream failure
