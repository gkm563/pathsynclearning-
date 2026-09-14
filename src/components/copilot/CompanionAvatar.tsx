import { cn } from "@/lib/cn";
import { copilotInitial, resolveCopilotName } from "@/lib/ai/copilot-identity";

function paletteFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 33 + name.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const shirt = (hue + 48) % 360;
  return {
    skin: `hsl(${hue} 42% 72%)`,
    skinShadow: `hsl(${hue} 38% 58%)`,
    shirt: `hsl(${shirt} 62% 48%)`,
    shirtDark: `hsl(${shirt} 62% 36%)`,
    pants: `hsl(${(hue + 200) % 360} 28% 32%)`,
    accent: `hsl(${(hue + 20) % 360} 70% 46%)`,
  };
}

const BOX = {
  sm: "h-8 w-7",
  md: "h-10 w-8",
  lg: "h-14 w-11",
} as const;

export function CompanionAvatar({
  name,
  size = "md",
  className,
  pose = "idle",
  facing = "right",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  tone?: "soft" | "onPrimary";
  pose?: "idle" | "walk" | "run" | "climb" | "jump" | "tap" | "wave" | "stretch" | "still";
  facing?: "left" | "right";
}) {
  const resolved = resolveCopilotName(name);
  const colors = paletteFromName(resolved);
  const letter = copilotInitial(resolved);

  return (
    <span
      className={cn(
        "companion-figure relative inline-flex items-end justify-center",
        pose === "walk" && "is-walk",
        pose === "run" && "is-run",
        pose === "climb" && "is-climb",
        pose === "jump" && "is-jump",
        pose === "idle" && "is-idle",
        pose === "tap" && "is-tap",
        pose === "wave" && "is-wave",
        pose === "stretch" && "is-stretch",
        facing === "left" && "-scale-x-100",
        BOX[size],
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 44 56" className="h-full w-full overflow-visible drop-shadow-[0_6px_10px_rgba(15,23,42,0.22)]">
        <ellipse cx="22" cy="53" rx="12" ry="2.4" fill="rgba(15,23,42,0.18)" />

        <g className="companion-leg companion-leg-l">
          <rect x="14" y="40" width="6.5" height="12" rx="2.2" fill={colors.pants} />
        </g>
        <g className="companion-leg companion-leg-r">
          <rect x="23.5" y="40" width="6.5" height="12" rx="2.2" fill={colors.pants} />
        </g>

        <rect x="12.5" y="26" width="19" height="16" rx="4" fill={colors.shirt} />
        <rect x="12.5" y="26" width="19" height="5" rx="2" fill={colors.shirtDark} />

        <g className="companion-arm companion-arm-l">
          <rect x="5.5" y="28" width="7" height="11" rx="3" fill={colors.skin} />
        </g>
        <g className="companion-arm companion-arm-r">
          <rect x="31.5" y="28" width="7" height="11" rx="3" fill={colors.skin} />
        </g>

        <g className="companion-head">
          <rect x="10" y="6" width="24" height="22" rx="7" fill={colors.skin} />
          <rect x="10" y="6" width="24" height="8" rx="7" fill={colors.accent} />
          <text
            x="22"
            y="12.5"
            textAnchor="middle"
            fontSize="7"
            fontWeight="700"
            fill="#fff"
            style={{ transform: facing === "left" ? "scaleX(-1)" : undefined, transformOrigin: "22px 10px" }}
          >
            {letter}
          </text>
          <g className="companion-eye">
            <ellipse cx="17" cy="20" rx="2.3" ry="2.8" fill="#0f172a" />
            <circle cx="17.7" cy="19.2" r="0.7" fill="#fff" />
          </g>
          <g className="companion-eye" style={{ animationDelay: "160ms" }}>
            <ellipse cx="27" cy="20" rx="2.3" ry="2.8" fill="#0f172a" />
            <circle cx="27.7" cy="19.2" r="0.7" fill="#fff" />
          </g>
          <path
            d="M17.5 24.5c1.4 1.6 7.6 1.6 9 0"
            fill="none"
            stroke={colors.skinShadow}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}
