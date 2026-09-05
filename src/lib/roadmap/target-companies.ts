export const TARGET_COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Stripe",
  "Atlassian",
  "Adobe",
  "Salesforce",
  "Goldman Sachs",
  "JPMorgan",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Razorpay",
  "PhonePe",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
] as const;

export const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "AI/ML Engineer",
  "Data Scientist",
  "Cybersecurity Engineer",
  "Cloud/DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Data Analyst",
] as const;

export const OTHER_COMPANY = "Other";
export const OTHER_ROLE = "Other";

export function resolvedTargetCompany(company: unknown, custom: unknown): string | null {
  const selected = typeof company === "string" ? company.trim() : "";
  const customName = typeof custom === "string" ? custom.trim() : "";
  const name = selected === OTHER_COMPANY ? customName : selected;
  return name || null;
}

export function resolvedTargetRole(role: unknown, custom: unknown): string | null {
  const selected = typeof role === "string" ? role.trim() : "";
  const customName = typeof custom === "string" ? custom.trim() : "";
  if (selected === OTHER_ROLE) return customName || null;
  return selected || null;
}

export function roadmapTitleForTarget(
  generatedTitle: string,
  targetRole: string | null,
  targetCompany: string | null,
) {
  const company = targetCompany?.trim();
  if (!company) return generatedTitle;
  if (generatedTitle.toLowerCase().includes(company.toLowerCase())) {
    return generatedTitle;
  }
  const role = targetRole?.trim();
  if (role && generatedTitle.toLowerCase().includes(role.toLowerCase())) {
    return `${company} · ${generatedTitle}`;
  }
  return `${company} ${role || generatedTitle} Path`.replace(/\s+/g, " ").trim();
}
