"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Select,
  Textarea,
} from "@/components/ui";
import type { ApplyDraft, PublicSquad } from "./types";

const GENERAL_ROLE = "General Collaborator";

export function ApplyDialog({
  squad,
  onClose,
  onSubmit,
}: {
  squad: PublicSquad | null;
  onClose: () => void;
  onSubmit: (draft: ApplyDraft) => void;
}) {
  const [role, setRole] = useState(GENERAL_ROLE);
  const [pitch, setPitch] = useState("");

  useEffect(() => {
    if (!squad) return;
    setRole(squad.openPositions[0] ?? GENERAL_ROLE);
    setPitch("");
  }, [squad]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!pitch.trim()) return;
    onSubmit({ role, pitch: pitch.trim() });
  };

  return (
    <Dialog
      open={squad !== null}
      onClose={onClose}
      size="md"
      title={squad ? `Apply to ${squad.name}` : "Apply to join"}
      description={
        squad
          ? `${squad.leader.name} will see this on their placement dashboard.`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="hack-squad-apply"
            disabled={!pitch.trim()}
          >
            Submit application
          </Button>
        </>
      }
    >
      {squad ? (
        <form
          id="hack-squad-apply"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field label="Target position" htmlFor="apply-role">
            <Select
              id="apply-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {squad.openPositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
              <option value={GENERAL_ROLE}>{GENERAL_ROLE}</option>
            </Select>
          </Field>
          <Field label="Pitch and availability" htmlFor="apply-pitch">
            <Textarea
              id="apply-pitch"
              required
              rows={5}
              value={pitch}
              onChange={(event) => setPitch(event.target.value)}
              placeholder="Relevant project experience, weekly hours, and why this squad should pick you."
            />
          </Field>
        </form>
      ) : null}
    </Dialog>
  );
}
