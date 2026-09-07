import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Hash,
  Layers,
  Megaphone,
  MessageCircle,
  Users,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "general-sde": MessageCircle,
  "dsa-questions": Hash,
  "system-design": Layers,
  "referral-board": Briefcase,
  "project-partners": Users,
  announcements: Megaphone,
};

export function channelIcon(id: string): LucideIcon {
  return ICONS[id] ?? Hash;
}
