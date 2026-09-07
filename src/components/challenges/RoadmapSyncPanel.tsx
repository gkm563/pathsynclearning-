"use client";

import { Link2, RefreshCw } from "lucide-react";
import type { ChallengeSyncPrefs } from "@/lib/challenges/types";
import { Badge, Button, Card, Switch } from "@/components/ui";

export default function RoadmapSyncPanel({
  sync,
  careerGoal,
  roadmapTopics,
  saving,
  onToggle,
  onOpenRoadmap,
}: {
  sync: ChallengeSyncPrefs;
  careerGoal: string | null;
  roadmapTopics: string[];
  saving?: boolean;
  onToggle: (enabled: boolean) => void;
  onOpenRoadmap?: () => void;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="type-h4 m-0 text-ink">Sync with roadmap</h3>
            <p className="type-small mt-1.5 mb-0 text-muted">
              When enabled, Challenge of the Day and All Questions prefer topics
              from your unfinished roadmap nodes
              {careerGoal ? (
                <>
                  {" "}
                  for <span className="font-semibold text-ink">{careerGoal}</span>
                </>
              ) : null}
              .
            </p>
          </div>
          <Switch
            checked={sync.enabled}
            onChange={onToggle}
            disabled={saving}
            label={sync.enabled ? "Synced" : "Off"}
          />
        </div>
        {sync.lastSyncedAt ? (
          <p className="type-caption mt-4 mb-0 inline-flex items-center gap-1.5 text-muted">
            <RefreshCw size={12} aria-hidden />
            Last updated {new Date(sync.lastSyncedAt).toLocaleString()}
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Link2 size={16} className="text-primary" aria-hidden />
          <h3 className="type-h4 m-0 text-ink">
            Active roadmap topics ({roadmapTopics.length})
          </h3>
        </div>
        {roadmapTopics.length === 0 ? (
          <p className="type-small m-0 text-muted">
            No unfinished roadmap topics yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roadmapTopics.slice(0, 24).map((t) => (
              <Badge key={t} tone="accent" className="normal-case tracking-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <Button variant="secondary" className="mt-4" onClick={onOpenRoadmap}>
          View roadmap
        </Button>
      </Card>
    </div>
  );
}
