import Link from "next/link";
import { cn } from "@/lib/cn";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: "h-8 w-8", word: "text-[17px]" },
  md: { mark: "h-9 w-9", word: "text-[20px]" },
  lg: { mark: "h-11 w-11", word: "text-[22px]" },
} as const;

export function BrandMark({
  href = "/",
  size = "md",
  inverted = false,
  showWordmark = true,
  className,
}: BrandMarkProps) {
  const s = sizes[size];
  return (
    <Link
      href={href}
      aria-label="PathEd"
      className={cn(
        "inline-flex items-center gap-2 no-underline",
        className,
      )}
    >
      <img
        src="/brand/pathed-logo.png"
        alt=""
        width={44}
        height={44}
        className={cn("shrink-0 object-contain", s.mark)}
        aria-hidden
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-bold tracking-[-0.045em]",
            s.word,
          )}
        >
          <span
            className={
              inverted ? "text-[var(--text-inverse)]" : "text-[var(--brand-ink)]"
            }
          >
            Path
          </span>
          <span className="text-[var(--brand)]">Ed</span>
        </span>
      ) : (
        <span className="sr-only">PathEd</span>
      )}
    </Link>
  );
}
