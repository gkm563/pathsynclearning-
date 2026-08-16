export type ThemeName = "light" | "dark";

export type AuthRole = "student" | "teacher" | "recruiter";

export interface Quote {
  phase: "motivation" | "pushing" | "determination" | string;
  text: string;
  author: string;
}

export interface AiInsight {
  icon: string;
  text: string;
}

export interface DevToArticle {
  title: string;
  description?: string;
  tag_list?: string[];
  url: string;
}

export interface NewsCard {
  title: string;
  desc: string;
  category: string;
  time: string;
  url: string;
  col: string;
}

export type DevPlan = "free" | "pro" | "elite" | string;

export interface NavLink {
  label: string;
  path: string;
}

export interface FooterLink {
  label: string;
  to: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}
