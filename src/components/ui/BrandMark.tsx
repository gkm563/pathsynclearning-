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
  sm: { mark: "h-8 w-8", word: "text-[20px]", optical: "translate-y-px" },
  md: { mark: "h-9 w-9", word: "text-[24px]", optical: "translate-y-0.5" },
  lg: { mark: "h-11 w-11", word: "text-[28px]", optical: "translate-y-0.5" },
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
        "flex h-8 items-center gap-2 no-underline",
        size === "md" && "h-9",
        size === "lg" && "h-11",
        className,
      )}
    >
      <img
        src="/brand/pathed-logo.png"
        alt=""
        width={44}
        height={44}
        className={cn("block shrink-0 object-contain object-center", s.mark)}
        aria-hidden
      />
      {showWordmark ? (
        <span
          className={cn(
            "leading-none font-bold tracking-[-0.045em]",
            s.word,
            s.optical,
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
