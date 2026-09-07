"use client";

import { NEWS_CATEGORIES } from "@/lib/news/constants";
import { Button, Dialog } from "@/components/ui";
import { cn } from "@/lib/cn";

export function PreferencesPanel({
  open,
  selected,
  onClose,
  onChange,
  onSave,
  saving,
}: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onChange: (categories: string[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Preferred categories"
      description="We'll prioritize these topics in your category strip. The feed still shows all news."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((cat) => {
          const on = selected.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(cat)}
              className={cn(
                "type-label inline-flex h-9 items-center rounded-full border px-3 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                on
                  ? "border-primary-border bg-primary-soft text-primary"
                  : "border-line bg-surface text-muted hover:bg-sunken hover:text-ink",
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
