"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Button,
  Dialog,
  FormField,
  RadioGroup,
  useToast,
} from "@/components/ui";
import { BOOKING_AGENDAS, BOOKING_SLOTS } from "./data";
import type { Mentor } from "./types";

/**
 * Premium 1-on-1 booking flow.
 *
 * Slot and agenda are native radio groups, so the whole flow is keyboard and
 * screen-reader operable. Confirmation replaces the form in place instead of
 * opening a second overlay.
 */
export function BookingDialog({
  mentor,
  onClose,
}: {
  mentor: Mentor | null;
  onClose: () => void;
}) {
  const toast = useToast();
  const [slot, setSlot] = useState("");
  const [agenda, setAgenda] = useState(BOOKING_AGENDAS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Reset between mentors so a previous selection never leaks into a new booking.
  useEffect(() => {
    if (!mentor) return;
    setSlot("");
    setAgenda(BOOKING_AGENDAS[0].id);
    setBooked(false);
    setSubmitting(false);
    setError(undefined);
  }, [mentor]);

  const confirm = async () => {
    if (!mentor) return;
    if (!slot) {
      setError("Pick a slot to continue.");
      toast.error("Please select a slot first.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    // Prototype dispatch — keeps the submitting state honest and observable.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    setBooked(true);
    toast.success({
      title: "1-on-1 confirmed",
      description: `${mentor.name} · ${slot}`,
    });
  };

  return (
    <Dialog
      open={mentor !== null}
      onClose={onClose}
      size="md"
      dismissible={!submitting}
      title={booked ? "Session confirmed" : "Book a 1-on-1"}
      description={mentor ? `with ${mentor.name} · ${mentor.company}` : undefined}
      footer={
        booked ? (
          <Button onClick={onClose} data-autofocus>
            Back to mentor space
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={() => void confirm()}>
              Confirm booking
            </Button>
          </>
        )
      }
    >
      {mentor && !booked ? (
        <fieldset disabled={submitting} className="min-w-0 border-0 p-0">
          <div className="flex flex-col gap-5">
            <FormField
              label="Available slot"
              required
              error={error}
              hint={`Mentor availability: ${mentor.availability}`}
            >
              {() => (
                <RadioGroup
                  name="booking-slot"
                  value={slot}
                  onChange={setSlot}
                  options={BOOKING_SLOTS.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                />
              )}
            </FormField>

            <FormField label="Session agenda" required>
              {() => (
                <RadioGroup
                  name="booking-agenda"
                  value={agenda}
                  onChange={setAgenda}
                  options={BOOKING_AGENDAS.map((option) => ({
                    value: option.id,
                    label: option.label,
                    description: option.description,
                  }))}
                />
              )}
            </FormField>
          </div>
        </fieldset>
      ) : null}

      {mentor && booked ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success"
            aria-hidden
          >
            <CheckCircle2 size={22} />
          </span>
          <h3 className="type-h4 m-0 text-ink">You're booked in</h3>
          <p className="type-small m-0 max-w-sm text-muted">
            Your session with {mentor.name} is scheduled for {slot}. A calendar
            invite, notes link and video room token are on your profile.
          </p>
        </div>
      ) : null}
    </Dialog>
  );
}
