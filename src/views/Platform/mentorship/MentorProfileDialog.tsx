"use client";

import { Check, Plus } from "lucide-react";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import { Badge, Button, DescriptionList, Dialog } from "@/components/ui";
import { mentorBio } from "./data";
import type { Mentor } from "./types";

/**
 * Mentor detail overlay opened from the browse grid.
 *
 * `Dialog` gives this the focus trap, scroll lock, Escape handling and mobile
 * bottom-sheet presentation, so the only thing here is content.
 */
export function MentorProfileDialog({
  mentor,
  added,
  onClose,
  onAdd,
}: {
  mentor: Mentor | null;
  added: boolean;
  onClose: () => void;
  onAdd: (id: string) => void;
}) {
  return (
    <Dialog
      open={mentor !== null}
      onClose={onClose}
      size="lg"
      title={mentor ? mentor.name : "Mentor profile"}
      description={mentor ? `${mentor.role} · ${mentor.company}` : undefined}
      footer={
        mentor ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              disabled={added}
              data-autofocus
              onClick={() => onAdd(mentor.id)}
            >
              {added ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
              {added ? "Already added" : "Add mentor"}
            </Button>
          </>
        ) : null
      }
    >
      {mentor ? (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] bg-sunken">
              <img
                src={mentor.image}
                alt={`Portrait of ${mentor.name}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <Badge tone="accent">{mentor.category} specialist</Badge>
              <blockquote className="type-body m-0 mt-3 border-l-2 border-primary-border pl-3.5 text-ink italic">
                {mentor.quote}
              </blockquote>
              <p className="type-small mt-3 mb-0 text-muted">{mentorBio(mentor)}</p>
            </div>
          </div>

          <DescriptionList
            items={[
              { label: "Experience", value: `${mentor.exp} years` },
              {
                label: "Rating",
                value: (
                  <span className="type-numeric">
                    {mentor.rating} from {mentor.reviews} reviews
                  </span>
                ),
              },
              { label: "Students coached", value: mentor.students },
              { label: "Availability", value: mentor.availability },
              { label: "Certifications", value: mentor.certifications.join(", ") },
              { label: "Roadmaps covered", value: mentor.roadmaps.join(", ") },
            ]}
          />

          <div>
            <p className="type-overline m-0 text-faint">Core expertise</p>
            <ul className="mt-2 flex list-none flex-wrap gap-1.5 p-0">
              {mentor.skills.map((skill) => (
                <li key={skill}>
                  <Badge tone="neutral">{skill}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-4">
            <AddNoteButton
              sourceType="mentorship"
              sourceId={mentor.id}
              defaultTitle={`Session with ${mentor.name}`}
              contextLabel={`Mentorship · ${mentor.name}`}
            />
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
