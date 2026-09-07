"use client";

import type { FormEvent } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

export function CreateProjectDialog({
  open,
  onClose,
  name,
  tech,
  progress,
  selectionType,
  slots,
  difficulty,
  invitedMember,
  description,
  onNameChange,
  onTechChange,
  onProgressChange,
  onSelectionTypeChange,
  onSlotsChange,
  onDifficultyChange,
  onInvitedMemberChange,
  onDescriptionChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  tech: string;
  progress: number;
  selectionType: string;
  slots: string;
  difficulty: string;
  invitedMember: string;
  description: string;
  onNameChange: (value: string) => void;
  onTechChange: (value: string) => void;
  onProgressChange: (value: number) => void;
  onSelectionTypeChange: (value: string) => void;
  onSlotsChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onInvitedMemberChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Post project to PathEd Squads"
      description="Rahul Kushwaha (You)"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form">
            Post project
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Project name" htmlFor="proj-name">
          <Input
            id="proj-name"
            required
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Real-Time Analytics Pipeline"
          />
        </Field>
        <Field label="Tech stack (comma-separated)" htmlFor="proj-tech">
          <Input
            id="proj-tech"
            required
            value={tech}
            onChange={(event) => onTechChange(event.target.value)}
            placeholder="e.g. React.js, Tailwind, WebSockets"
          />
        </Field>
        <Field label="Collaboration category" htmlFor="proj-category">
          <Select
            id="proj-category"
            value={selectionType}
            onChange={(event) => onSelectionTypeChange(event.target.value)}
          >
            <option value="collaborators">Search collaborators / team squads</option>
            <option value="recruit">Recruiting / job & SDE internships</option>
            <option value="participate">Open participation / hackathons</option>
          </Select>
        </Field>
        <Field label="Project difficulty" htmlFor="proj-difficulty">
          <Select
            id="proj-difficulty"
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Expert">Expert</option>
          </Select>
        </Field>
        <Field label={`Initial progress (${progress}%)`} htmlFor="proj-progress">
          <input
            id="proj-progress"
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => onProgressChange(Number(event.target.value))}
            className="min-h-11 w-full accent-[var(--primary)]"
          />
        </Field>
        <Field label="Target open slots" htmlFor="proj-slots">
          <Input
            id="proj-slots"
            required
            value={slots}
            onChange={(event) => onSlotsChange(event.target.value)}
            placeholder="e.g. Need 2 Frontend Developers"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Allocate / invite teammate"
            htmlFor="proj-invite"
            hint="Entering a name automatically sends an invitation payload to their dashboard inbox. They will join the project upon acceptance."
          >
            <Input
              id="proj-invite"
              value={invitedMember}
              onChange={(event) => onInvitedMemberChange(event.target.value)}
              placeholder="Type a Member name (e.g. Anjali Sharma, Rohan Das)"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Detailed project description & squad goals" htmlFor="proj-desc">
            <Textarea
              id="proj-desc"
              required
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Describe the system functionalities, target features, and what skills you are looking for..."
            />
          </Field>
        </div>
      </form>
    </Dialog>
  );
}
