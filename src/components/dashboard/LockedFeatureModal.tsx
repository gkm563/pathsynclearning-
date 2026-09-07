"use client";

import { useRouter } from "next/navigation";
import {
  Lock,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Button, Dialog } from "@/components/ui";
import { routes } from "@/lib/routes";

export interface LockedFeature {
  id?: string;
  icon?: ReactNode;
  label: string;
  accent?: string;
  desc?: string;
  req?: string;
}

interface LockedFeatureModalProps {
  feature: LockedFeature | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LockedFeatureModal({
  feature,
  isOpen,
  onClose,
}: LockedFeatureModalProps) {
  const router = useRouter();
  const open = isOpen && feature !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={feature?.label ?? "Feature locked"}
      size="md"
      footer={
        <>
          <Button variant="secondary" className="sm:flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="sm:flex-[1.5]"
            onClick={() => {
              onClose();
              router.push(routes.app.store);
            }}
          >
            <ShoppingBag size={16} aria-hidden />
            Go to Store
            <ArrowRight size={16} aria-hidden />
          </Button>
        </>
      }
    >
      {feature ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft text-3xl text-danger">
            {feature.icon || <Lock size={32} aria-hidden />}
          </div>
          <Badge tone="error" className="mb-4 gap-1.5">
            <Lock size={12} aria-hidden />
            Feature currently locked
          </Badge>
          <div className="mb-5 w-full rounded-[var(--radius-md)] border border-line bg-sunken p-4 text-left">
            <p className="type-overline m-0 text-primary">
              Feature description & benefits
            </p>
            <p className="type-small mt-1.5 mb-3 text-muted">
              {feature.desc ||
                "Unlock access to senior engineering mentors, collaborative project teams, referral networks, and institutional summits."}
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="type-small flex items-center gap-2 font-semibold text-ink">
                <CheckCircle2 size={14} className="text-success" aria-hidden />
                Verified peer & recruiter connections
              </div>
              <div className="type-small flex items-center gap-2 font-semibold text-ink">
                <CheckCircle2 size={14} className="text-success" aria-hidden />
                Real-time collaborative workspace access
              </div>
            </div>
          </div>
          <div className="mb-1 w-full rounded-[var(--radius-md)] border border-primary-border bg-primary-soft px-4 py-3 text-left">
            <p className="type-overline m-0 text-primary">How to unlock</p>
            <div className="type-label mt-1 flex items-center gap-2 text-ink">
              <ShieldAlert size={16} className="text-warning" aria-hidden />
              {feature.req || "2,000 XP or PathEd Store Pass"}
            </div>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
