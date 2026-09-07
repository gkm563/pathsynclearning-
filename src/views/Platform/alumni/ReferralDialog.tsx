"use client";

import { CheckCircle2, FileText, Lock } from "lucide-react";
import { Button, Dialog, Textarea } from "@/components/ui";
import type { AlumniProfile } from "./types";

export function ReferralDialog({
  alumnus,
  isPremium,
  step,
  resumeUploaded,
  pitch,
  onClose,
  onUpgrade,
  onStep,
  onUpload,
  onPitchChange,
  onSubmit,
}: {
  alumnus: AlumniProfile | null;
  isPremium: boolean;
  step: number;
  resumeUploaded: boolean;
  pitch: string;
  onClose: () => void;
  onUpgrade: () => void;
  onStep: (step: number) => void;
  onUpload: () => void;
  onPitchChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog
      open={alumnus !== null}
      onClose={onClose}
      title={alumnus ? `Request referral — ${alumnus.company}` : "Request referral"}
      size="md"
    >
      {!alumnus ? null : !isPremium ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Lock size={20} aria-hidden />
          </span>
          <div>
            <h3 className="type-h4 m-0 text-ink">Referral pipelines locked</h3>
            <p className="type-small mx-auto mt-1 mb-0 max-w-sm text-muted">
              Submit resumes directly to seniors at meta, Google, and Amazon. Upgrade to PathEd Premium to start validation.
            </p>
          </div>
          <Button className="min-h-11" onClick={onUpgrade}>
            Unlock placement VIP store
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex gap-2" aria-hidden>
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className={
                  step >= item
                    ? "h-1.5 flex-1 rounded-full bg-primary"
                    : "h-1.5 flex-1 rounded-full bg-sunken"
                }
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <p className="type-caption m-0 font-semibold text-primary">
                Step 1 of 3: Resume submission
              </p>
              <p className="type-small m-0 text-muted">
                Upload your latest resume. PathEd parses your projects and compiles them to match {alumnus.company}&apos;s active tech stack requirements.
              </p>
              <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-line bg-sunken px-4 py-6 text-center">
                <FileText size={22} className={resumeUploaded ? "text-success" : "text-primary"} aria-hidden />
                <p className="type-small m-0 font-semibold text-ink">
                  {resumeUploaded ? "Resume_Rahul_Kushwaha.pdf" : "Select SDE resume document"}
                </p>
                <p className="type-caption m-0 text-muted">PDF, DOCX formats accepted (Max 4MB)</p>
                {resumeUploaded ? (
                  <p className="type-caption m-0 text-success">Upload verification success</p>
                ) : (
                  <Button variant="secondary" className="min-h-11" onClick={onUpload}>
                    Upload file
                  </Button>
                )}
              </div>
              <Button className="min-h-11" disabled={!resumeUploaded} onClick={() => onStep(2)}>
                Continue to step 2
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-4">
              <p className="type-caption m-0 font-semibold text-primary">
                Step 2 of 3: CRI score check
              </p>
              <p className="type-small m-0 text-muted">
                Companies require referral candidates to exceed a baseline SDE competence score. Your profile CRI values:
              </p>
              <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-line bg-sunken p-4">
                <div>
                  <p className="type-caption m-0 text-faint">Your active CRI score</p>
                  <p className="type-h3 type-numeric m-0 text-success">785 / 1000</p>
                </div>
                <div>
                  <p className="type-caption m-0 text-faint">Minimum SDE bar</p>
                  <p className="type-h4 type-numeric m-0 text-ink">700 +</p>
                </div>
              </div>
              <p className="type-small m-0 inline-flex items-center gap-2 text-success">
                <CheckCircle2 size={16} aria-hidden />
                Validation complete: Your profile meets referral bars!
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" className="min-h-11 flex-1" onClick={() => onStep(1)}>
                  Back
                </Button>
                <Button className="min-h-11 flex-[1.5]" onClick={() => onStep(3)}>
                  Continue to step 3
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-4">
              <p className="type-caption m-0 font-semibold text-primary">
                Step 3 of 3: Core specialty pitch
              </p>
              <p className="type-small m-0 text-muted">
                Summarize your specialties and why you are a fit for {alumnus.company}&apos;s engineering teams. Aman will forward this pitch alongside your resume.
              </p>
              <Textarea
                required
                value={pitch}
                onChange={(event) => onPitchChange(event.target.value)}
                placeholder="Describe your background, open source contributions, or roadmap challenges you excelled at..."
              />
              <div className="flex gap-2">
                <Button variant="secondary" className="min-h-11 flex-1" onClick={() => onStep(2)}>
                  Back
                </Button>
                <Button
                  className="min-h-11 flex-[1.5]"
                  disabled={!pitch.trim()}
                  onClick={onSubmit}
                >
                  Submit application
                </Button>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <p className="type-small m-0 text-muted">Submitting referral application…</p>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
