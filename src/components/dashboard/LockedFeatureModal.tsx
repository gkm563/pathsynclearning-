"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShoppingBag, X, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
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

export default function LockedFeatureModal({ feature, isOpen, onClose }: LockedFeatureModalProps) {
  const router = useRouter();
  if (!isOpen || !feature) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[500px] overflow-hidden rounded-3xl border-[1.5px] border-[var(--border-light)] bg-[var(--bg-card)] p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.3)]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-alt)] text-[var(--text-main)]"
          >
            <X size={16} />
          </button>
          <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl border-[1.5px] border-red-500 bg-red-500/12 text-[32px] text-red-500">
            {feature.icon || <Lock size={32} />}
          </div>
          <h3 className="mb-1.5 font-display text-2xl font-extrabold text-[var(--text-main)]">{feature.label}</h3>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-1 font-mono text-[11px] font-bold text-red-500">
            <Lock size={12} /> FEATURE CURRENTLY LOCKED
          </div>
          <div className="mb-5 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-alt)] p-4 text-left">
            <div className="mb-1.5 font-mono text-[10px] font-bold tracking-wide" style={{ color: feature.accent || "#6c63ff" }}>
              FEATURE DESCRIPTION & BENEFITS
            </div>
            <p className="mb-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
              {feature.desc || "Unlock access to senior engineering mentors, collaborative project teams, referral networks, and institutional summits."}
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
                <CheckCircle2 size={14} color="#00c9a7" /> Verified peer & recruiter connections
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
                <CheckCircle2 size={14} color="#00c9a7" /> Real-time collaborative workspace access
              </div>
            </div>
          </div>
          <div className="mb-6 rounded-[14px] border border-[#6c63ff]/30 bg-[#6c63ff]/8 px-4 py-3 text-left">
            <div className="mb-0.5 font-mono text-[10px] font-bold tracking-wide text-[#6c63ff]">HOW TO UNLOCK</div>
            <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[var(--text-main)]">
              <ShieldAlert size={16} color="#f7971e" /> {feature.req || "2,000 XP or PathEd Store Pass"}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] py-3 font-display text-sm font-bold text-[var(--text-main)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(routes.app.store);
              }}
              className="flex flex-[1.5] items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#6c63ff] to-[#00c9a7] py-3 font-display text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(108,99,255,0.3)]"
            >
              <ShoppingBag size={16} /> Go to Store <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
