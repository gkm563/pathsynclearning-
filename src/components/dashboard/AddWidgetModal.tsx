"use client";

import { Plus, Sparkles, Check } from "lucide-react";
import { Badge, Button, Card, Dialog } from "@/components/ui";

export type DashboardWidget = {
  id: string;
  label: string;
  icon: string;
  specialColor?: boolean;
  accent?: string;
  bg?: string;
  border?: string;
  desc: string;
};

export const ALL_AVAILABLE_WIDGETS: DashboardWidget[] = [
  // Special Colored Cards
  {
    id: "room-of-honor",
    label: "Room of Honor",
    icon: "🏅",
    specialColor: true,
    accent: "#b45309",
    bg: "linear-gradient(135deg, rgba(254,243,199,0.2), rgba(253,224,71,0.15))",
    border: "#fcd34d",
    desc: "Your personal hall of fame inside PathEd. Enshrines every major milestone, streak achievement, and hackathon win."
  },
  {
    id: "soft-corner",
    label: "Soft Corner",
    icon: "💙",
    specialColor: true,
    accent: "#be185d",
    bg: "linear-gradient(135deg, rgba(252,231,243,0.2), rgba(249,168,212,0.15))",
    border: "#f9a8d4",
    desc: "Private note-taking and mental sanctuary for reflections, journal entries, and personal career notes."
  },
  {
    id: "hall-of-fame",
    label: "Hall of Fame",
    icon: "🏆",
    specialColor: true,
    accent: "#1b4540",
    bg: "linear-gradient(135deg, rgba(27,69,64,0.12), rgba(27,69,64,0.1))",
    border: "#1b4540",
    desc: "Global institutional leaderboard showcasing Platinum-tier students, top XP sprint leaders, and CRI achievers."
  },
  {
    id: "community-card",
    label: "Community",
    icon: "👥",
    specialColor: true,
    accent: "#1565c0",
    bg: "linear-gradient(135deg, rgba(227,242,253,0.2), rgba(144,202,249,0.15))",
    border: "#90caf9",
    desc: "Connect with peer study circles, share project breakdowns, and build reputation points across your institution."
  },

  // Standard Feature Cards
  {
    id: "my-roadmap",
    label: "My Roadmap",
    icon: "🗺️",
    accent: "#1b4540",
    desc: "Your 4-year SDE skill blueprint mapped to your college curriculum with target milestones."
  },
  {
    id: "daily-challenges",
    label: "Daily Challenges",
    icon: "⚡",
    accent: "#f7971e",
    desc: "Four fresh coding and CS fundamental challenges dropped every morning with XP streak multipliers."
  },
  {
    id: "progress-report",
    label: "Progress Report",
    icon: "📊",
    accent: "#1f6b48",
    desc: "Live analytics dashboard tracking your CRI score, skill velocity, and consistency heatmap."
  },
  {
    id: "hackattack",
    label: "HackAttack Arena",
    icon: "⚔️",
    accent: "#e040fb",
    desc: "Competitive arena matching live hackathons and coding sprints to your current skill level."
  },
  {
    id: "interview-prep",
    label: "Interview Prep",
    icon: "🎤",
    accent: "#1b4540",
    desc: "Mock interview engine with company-specific DSA rounds, whiteboard sessions, and AI feedback."
  },
  {
    id: "placement-inbox",
    label: "Placement Inbox",
    icon: "📥",
    accent: "#f7971e",
    desc: "Direct messaging channel where verified recruiters send job offers based on your CRI score."
  },
  {
    id: "certifications",
    label: "Certifications Vault",
    icon: "📜",
    accent: "#1f6b48",
    desc: "Digitally verifiable credentials and skill badges shareable on LinkedIn and resume portfolios."
  },
  {
    id: "pathed-store",
    label: "PathEd Store",
    icon: "🛍️",
    accent: "#1b4540",
    desc: "Redeem XP and coins for roadmap themes, streak shields, and partner platform vouchers."
  }
];

type AddWidgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: Array<{ id: string }>;
  onAddWidget: (widget: DashboardWidget) => void;
  onRemoveWidget: (id: string) => void;
};

export default function AddWidgetModal({
  isOpen,
  onClose,
  activeWidgets,
  onAddWidget,
  onRemoveWidget,
}: AddWidgetModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="lg"
      title="Customize Your Workspace"
      description="Select widgets to add or remove from your personal dashboard grid."
    >
      <div className="mb-4 flex items-center gap-2 text-primary">
        <Sparkles size={18} aria-hidden />
        <span className="type-caption text-muted">Dashboard widgets</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ALL_AVAILABLE_WIDGETS.map((widget) => {
          const isAdded = activeWidgets.some((w) => w.id === widget.id);
          return (
            <Card
              key={widget.id}
              className="flex flex-col justify-between bg-sunken shadow-none"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {widget.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="type-label m-0 text-ink">{widget.label}</h3>
                    {widget.specialColor ? (
                      <Badge tone="accent">Special</Badge>
                    ) : null}
                  </div>
                  <p className="type-caption mt-1 mb-0 text-muted">{widget.desc}</p>
                </div>
              </div>
              <Button
                variant={isAdded ? "danger" : "primary"}
                size="sm"
                className="w-full"
                onClick={() =>
                  isAdded ? onRemoveWidget(widget.id) : onAddWidget(widget)
                }
              >
                {isAdded ? (
                  <>
                    <Check size={14} aria-hidden />
                    Added to Workspace (Click to Remove)
                  </>
                ) : (
                  <>
                    <Plus size={14} aria-hidden />
                    Add to Workspace
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </Dialog>
  );
}
