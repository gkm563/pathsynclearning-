"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Archive, Coins, Gauge, MapPin } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  useToast,
} from "@/components/ui";
import { routes } from "@/lib/routes";
import {
  STATUS_TONE,
  STUDENT_CRI,
  type RecruiterMessage,
} from "./inbox-data";

type Pending = "accept" | "decline" | null;

const FACT_ICONS = { Coins, MapPin, Gauge };

/** Simulated round-trip so the action buttons have an honest busy state. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 420));
}

function Fact({
  icon,
  label,
  value,
  emphasis = false,
}: {
  icon: keyof typeof FACT_ICONS;
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const Icon = FACT_ICONS[icon];
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3">
      <p className="type-overline m-0 flex items-center gap-1.5 text-faint">
        <Icon size={13} aria-hidden />
        {label}
      </p>
      <p
        className={
          emphasis
            ? "type-label type-numeric mt-1.5 mb-0 text-primary"
            : "type-label mt-1.5 mb-0 text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Full recruiter message.
 *
 * Renders as the right pane on desktop and as a standalone screen on phones,
 * where `onBack` is supplied and a back affordance appears.
 */
export function MessageDetail({
  message,
  onBack,
  onArchive,
}: {
  message: RecruiterMessage;
  onBack?: () => void;
  onArchive: (message: RecruiterMessage) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState<Pending>(null);

  const shortfall = message.criThreshold - STUDENT_CRI;
  const locked = shortfall > 0;
  const busy = pending !== null;

  const accept = async () => {
    setPending("accept");
    await settle();
    setPending(null);
    toast.success({
      title: "Interview scheduled",
      description: `We synced the slot to your calendar and confirmed with ${message.recruiter.name}.`,
    });
  };

  const decline = async () => {
    setPending("decline");
    await settle();
    setPending(null);
    toast.info({
      title: "Invitation declined",
      description: `We shared your feedback with ${message.recruiter.name}.`,
    });
  };

  return (
    <Card className="flex min-w-0 flex-col gap-6" padded>
      <div className="flex min-w-0 flex-col gap-4">
        {onBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 self-start lg:hidden"
          >
            <ArrowLeft size={15} aria-hidden />
            All messages
          </Button>
        ) : null}

        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="type-h4 grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line bg-sunken text-primary"
            >
              {message.initials}
            </span>
            <div className="min-w-0">
              <h2 className="type-h3 m-0 text-ink">{message.role}</h2>
              <p className="type-small mt-1 mb-0 text-muted">
                {message.company} · Received {message.receivedOn}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={STATUS_TONE[message.status.kind]}>
              {message.status.label}
            </Badge>
            <IconButton
              label={`Archive message from ${message.company}`}
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => onArchive(message)}
            >
              <Archive size={16} aria-hidden />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Fact icon="Coins" label="Compensation" value={message.compensation} />
        <Fact icon="MapPin" label="Location" value={message.location} />
        <Fact
          icon="Gauge"
          label="CRI threshold"
          value={`${message.criThreshold}% required`}
          emphasis
        />
      </div>

      <div className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3">
        <Avatar
          src={message.recruiter.imageUrl}
          name={message.recruiter.name}
          size="md"
        />
        <div className="min-w-0">
          <p className="type-label m-0 flex flex-wrap items-center gap-2 text-ink">
            {message.recruiter.name}
            <Badge tone="accent">Recruiter</Badge>
          </p>
          <p className="type-small mt-0.5 mb-0 text-muted">
            {message.recruiter.title} · {message.company}
          </p>
        </div>
      </div>

      <div className="type-body type-prose flex flex-col gap-3 text-ink">
        {message.body.split("\n\n").map((paragraph, index) => (
          <p key={index} className="m-0 whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      {locked ? (
        <Alert tone="warning" title="This invite is not unlocked yet">
          {message.company} screens at {message.criThreshold}% CRI and you are
          at {STUDENT_CRI}%. Close the {shortfall}-point gap by verifying the
          remaining nodes on your roadmap, then the slot opens automatically.
          <span className="mt-3 block">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(routes.app.roadmap)}
            >
              Open my roadmap
            </Button>
          </span>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() =>
            toast.info({
              title: `${message.company} · ${message.role}`,
              description:
                "The full role brief, team structure and interview loop open here once the recruiter portal ships.",
            })
          }
        >
          View details
        </Button>
        <Button
          variant="danger"
          loading={pending === "decline"}
          disabled={busy}
          onClick={decline}
        >
          Decline
        </Button>
        <Button
          loading={pending === "accept"}
          disabled={busy || locked}
          onClick={accept}
        >
          {locked ? "Locked" : "Accept invite"}
        </Button>
      </div>
    </Card>
  );
}
