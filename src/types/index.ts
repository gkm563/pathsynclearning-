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
