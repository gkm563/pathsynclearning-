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
  sm: { mark: "h-8 w-8 text-[13px]", word: "text-[17px]" },
  md: { mark: "h-9 w-9 text-sm", word: "text-[20px]" },
  lg: { mark: "h-10 w-10 text-base", word: "text-[22px]" },
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
      className={cn(
        "inline-flex items-center gap-2.5 no-underline",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-[10px] font-bold tracking-tight text-[var(--text-on-primary)]",
          "bg-[var(--primary)] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
          s.mark,
        )}
        aria-hidden
      >
        P
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-[-0.04em]",
            s.word,
            inverted ? "text-[var(--text-inverse)]" : "text-[var(--text-main)]",
          )}
        >
          PathEd
        </span>
      ) : (
        <span className="sr-only">PathEd</span>
      )}
    </Link>
  );
}
