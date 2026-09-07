import type { ComponentType } from "react";
import {
  BookOpen,
  Code2,
  Cpu,
  Database,
  Globe,
  GitBranch,
  Link2,
  Network,
  Trophy,
  Wrench,
  Zap,
} from "lucide-react";
import type { ChallengeIconKey } from "@/lib/challenges/types";

const MAP: Record<
  ChallengeIconKey,
  ComponentType<{ size?: number; className?: string; color?: string }>
> = {
  code: Code2,
  tree: GitBranch,
  link: Link2,
  cpu: Cpu,
  globe: Globe,
  book: BookOpen,
  database: Database,
  wrench: Wrench,
  trophy: Trophy,
  bolt: Zap,
  network: Network,
};

export default function ChallengeIcon({
  name,
  size = 20,
  color,
  className,
}: {
  name: ChallengeIconKey | string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const Comp =
    MAP[(name as ChallengeIconKey) in MAP ? (name as ChallengeIconKey) : "code"];
  return <Comp size={size} color={color} className={className} />;
}
