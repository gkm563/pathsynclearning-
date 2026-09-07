"use client";

import { FormEvent, useEffect, useState } from "react";
import { GitCommitHorizontal, X } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { DEFAULT_SQUAD_DURATION_HOURS } from "./data";
import type { NewSquadDraft } from "./types";

function tomorrowIsoDate(): string {
  return new Date(Date.now() + 86_400_000).toISOString().split("T")[0] ?? "";
}

export function CreateSquadDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewSquadDraft) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [hackathon, setHackathon] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [teamSize, setTeamSize] = useState("4");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("12:00");
  const [eventDuration, setEventDuration] = useState(DEFAULT_SQUAD_DURATION_HOURS);
  const [memberInputId, setMemberInputId] = useState("");
  const [inviteIds, setInviteIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setHackathon("");
    setDescription("");
    setRequiredSkills("");
    setTeamSize("4");
    setEventDate(tomorrowIsoDate());
    setEventTime("12:00");
    setEventDuration(DEFAULT_SQUAD_DURATION_HOURS);
    setMemberInputId("");
    setInviteIds([]);
  }, [open]);

  const addInvite = () => {
    const cleanId = memberInputId.trim().toUpperCase();
    if (!cleanId) return;
    if (inviteIds.includes(cleanId)) {
      toast.error("That user ID is already in the invite queue.");
      return;
    }
    setInviteIds((previous) => [...previous, cleanId]);
    setMemberInputId("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !hackathon.trim()) return;
    onCreate({
      name: name.trim(),
      hackathon: hackathon.trim(),
      description: description.trim(),
      requiredSkills: requiredSkills.trim(),
      teamSize,
      eventDate,
      eventTime,
      eventDuration,
      inviteIds,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Create a hack squad"
      description="Spins up a private workspace, sprint board and GitHub sync for the event."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-hack-squad">
            Deploy workspace
          </Button>
        </>
      }
    >
      <form
        id="create-hack-squad"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Squad name" htmlFor="new-squad-name">
            <Input
              id="new-squad-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Hyperion AI"
            />
          </Field>
          <Field label="Target hackathon" htmlFor="new-squad-hackathon">
            <Input
              id="new-squad-hackathon"
              required
              value={hackathon}
              onChange={(event) => setHackathon(event.target.value)}
              placeholder="e.g. Google AI Hackathon"
            />
          </Field>
        </div>

        <Field label="Description and goals" htmlFor="new-squad-desc">
          <Textarea
            id="new-squad-desc"
            required
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What you want to build, and what this squad is aiming for."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Event date" htmlFor="new-squad-date">
            <Input
              id="new-squad-date"
              type="date"
              required
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </Field>
          <Field label="Event time" htmlFor="new-squad-time">
            <Input
              id="new-squad-time"
              type="time"
              required
              value={eventTime}
              onChange={(event) => setEventTime(event.target.value)}
            />
          </Field>
          <Field label="Duration (hours)" htmlFor="new-squad-duration">
            <Input
              id="new-squad-duration"
              type="number"
              min={1}
              required
              value={eventDuration}
              onChange={(event) => setEventDuration(event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Field label="Skills you are seeking" htmlFor="new-squad-skills">
            <Input
              id="new-squad-skills"
              value={requiredSkills}
              onChange={(event) => setRequiredSkills(event.target.value)}
              placeholder="e.g. React, Docker, Python"
            />
          </Field>
          <Field label="Team size" htmlFor="new-squad-size">
            <Select
              id="new-squad-size"
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
            >
              <option value="3">3 members</option>
              <option value="4">4 members</option>
              <option value="5">5 members</option>
              <option value="6">6 members</option>
            </Select>
          </Field>
        </div>

        <div className="rounded-[var(--radius-md)] border border-line bg-sunken p-4">
          <h3 className="type-label m-0 mb-3 text-ink">
            Invite members (limit {teamSize})
          </h3>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={memberInputId}
              onChange={(event) => setMemberInputId(event.target.value)}
              placeholder="Unique user ID, e.g. USER-7729"
              aria-label="Invite user ID"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addInvite();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={addInvite}
            >
              Add
            </Button>
          </div>
          {inviteIds.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {inviteIds.map((id) => (
                <li key={id}>
                  <Badge tone="accent" className="normal-case tracking-normal">
                    <span className="inline-flex items-center gap-1">
                      {id}
                      <button
                        type="button"
                        className="inline-flex text-current"
                        aria-label={`Remove ${id}`}
                        onClick={() =>
                          setInviteIds((previous) =>
                            previous.filter((item) => item !== id),
                          )
                        }
                      >
                        <X size={12} aria-hidden />
                      </button>
                    </span>
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-caption m-0 text-faint">
              No invites queued. You can still deploy and add people later.
            </p>
          )}
        </div>

        <Alert tone="info" title="GitHub sync">
          <span className="inline-flex items-center gap-2">
            <GitCommitHorizontal size={14} aria-hidden />
            A private repository is linked to the sprint board when the workspace
            launches.
          </span>
        </Alert>
      </form>
    </Dialog>
  );
}
