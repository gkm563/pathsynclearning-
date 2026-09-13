"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { fieldClass } from "./primitives";

type SelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  group?: string;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "multiple"
>;

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children);
  }
  return "";
}

function collectOptions(children: ReactNode, group?: string): SelectOption[] {
  const out: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      out.push(
        ...collectOptions(
          (child.props as { children?: ReactNode }).children,
          group,
        ),
      );
      return;
    }
    if (child.type === "optgroup") {
      const props = child.props as {
        label?: string;
        children?: ReactNode;
      };
      out.push(...collectOptions(props.children, props.label));
      return;
    }
    if (child.type !== "option") return;
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
      title?: string;
      "data-hint"?: string;
    };
    const label = nodeText(props.children).replace(/\s+/g, " ").trim();
    out.push({
      value: props.value != null ? String(props.value) : label,
      label,
      hint: props["data-hint"] || props.title,
      disabled: Boolean(props.disabled),
      group,
    });
  });
  return out;
}

function usePortalTarget() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.body), []);
  return target;
}

/**
 * Custom listbox used everywhere `<Select>` is rendered.
 *
 * Native `<select>` option lists cannot be styled and, on Windows, often
 * collapse spaces when a webfont is inherited. This keeps the existing
 * `value` / `onChange` / `<option>` API so call sites do not change.
 */
export function Select({
  id,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  className,
  children,
  autoFocus,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const options = useMemo(() => collectOptions(children), [children]);
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() =>
    defaultValue != null ? String(defaultValue) : String(options[0]?.value ?? ""),
  );
  const selected = isControlled ? String(value) : uncontrolled;
  const selectedOption = options.find((item) => item.value === selected);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUp: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef({ query: "", at: 0 });
  const listId = useId();
  const portal = usePortalTarget();
  const reduceMotion = useReducedMotion();

  const enabledIndexes = useMemo(
    () => options.map((item, index) => (item.disabled ? -1 : index)).filter((i) => i >= 0),
    [options],
  );

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const commit = (next: string) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.({
      target: { value: next, name: name ?? "" },
      currentTarget: { value: next, name: name ?? "" },
    } as ChangeEvent<HTMLSelectElement>);
    close();
  };

  const updateCoords = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gutter = 8;
    const spaceBelow = window.innerHeight - rect.bottom - gutter;
    const spaceAbove = rect.top - gutter;
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(320, openUp ? spaceAbove : spaceBelow));
    setCoords({
      top: openUp ? rect.top - gutter : rect.bottom + gutter,
      left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 220) - gutter),
      width: Math.max(rect.width, Math.min(rect.width, window.innerWidth - gutter * 2)),
      maxHeight,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((item) => item.value === selected);
    setHighlight(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
    updateCoords();
    const onReposition = () => updateCoords();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, options, selected, enabledIndexes]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if (triggerRef.current && path.includes(triggerRef.current)) return;
      if (listRef.current && path.includes(listRef.current)) return;
      setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>("[data-active]");
    node?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  const moveHighlight = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const current = enabledIndexes.indexOf(highlight);
    const next =
      current < 0
        ? dir === 1
          ? enabledIndexes[0]
          : enabledIndexes[enabledIndexes.length - 1]
        : enabledIndexes[(current + dir + enabledIndexes.length) % enabledIndexes.length];
    setHighlight(next);
  };

  const typeahead = (key: string) => {
    const now = Date.now();
    const next =
      now - searchRef.current.at < 500 ? `${searchRef.current.query}${key}` : key;
    searchRef.current = { query: next, at: now };
    const match = options.findIndex(
      (item) =>
        !item.disabled && item.label.toLowerCase().startsWith(next.toLowerCase()),
    );
    if (match >= 0) {
      setHighlight(match);
      if (!open) commit(options[match].value);
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const item = options[highlight];
      if (item && !item.disabled) commit(item.value);
      return;
    }
    if (event.key === "Home" && open) {
      event.preventDefault();
      setHighlight(enabledIndexes[0] ?? -1);
      return;
    }
    if (event.key === "End" && open) {
      event.preventDefault();
      setHighlight(enabledIndexes[enabledIndexes.length - 1] ?? -1);
      return;
    }
    if (event.key === "Tab" && open) setOpen(false);
    if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      typeahead(event.key);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <select
        name={name}
        value={selected}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={() => undefined}
      >
        {options.map((item) => (
          <option key={`${item.group ?? ""}:${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          fieldClass,
          "flex items-center gap-2 pr-3 text-left",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate tracking-normal",
            !selectedOption && "text-[var(--text-placeholder)]",
          )}
        >
          {selectedOption?.label || "Select…"}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn(
            "shrink-0 text-[var(--text-muted)] transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {portal
        ? createPortal(
            <AnimatePresence>
              {open && coords ? (
                <motion.div
                  ref={listRef}
                  id={listId}
                  role="listbox"
                  data-floating
                  aria-label={ariaLabel}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: coords.openUp ? 4 : -4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: coords.openUp ? 4 : -4 }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.14 }}
                  style={{
                    zIndex: "var(--z-popover)",
                    position: "fixed",
                    left: coords.left,
                    width: Math.min(Math.max(coords.width, 220), window.innerWidth - 16),
                    maxHeight: coords.maxHeight,
                    ...(coords.openUp
                      ? { bottom: window.innerHeight - coords.top }
                      : { top: coords.top }),
                  }}
                  className="overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-lg)]"
                >
                  {options.length === 0 ? (
                    <p className="type-small m-0 px-2.5 py-3 text-center text-muted">
                      Nothing to choose
                    </p>
                  ) : (
                    options.map((item, index) => {
                      const prevGroup = options[index - 1]?.group;
                      const showGroup = item.group && item.group !== prevGroup;
                      const active = index === highlight;
                      const isSelected = item.value === selected;
                      return (
                        <div key={`${item.group ?? ""}:${item.value}:${index}`}>
                          {showGroup ? (
                            <p className="type-overline m-0 px-2.5 pt-2 pb-1 text-[var(--text-muted)]">
                              {item.group}
                            </p>
                          ) : null}
                          <button
                            type="button"
                            role="option"
                            data-active={active ? "" : undefined}
                            aria-selected={isSelected}
                            disabled={item.disabled}
                            onMouseEnter={() => {
                              if (!item.disabled) setHighlight(index);
                            }}
                            onClick={() => {
                              if (!item.disabled) commit(item.value);
                            }}
                            className={cn(
                              "flex w-full items-start gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left transition-colors",
                              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--ring)]",
                              item.disabled && "pointer-events-none opacity-40",
                              active
                                ? "bg-[var(--primary-soft)] text-[var(--text-main)]"
                                : "text-[var(--text-main)] hover:bg-[var(--bg-alt)]",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium tracking-normal [overflow-wrap:anywhere]">
                                {item.label}
                              </span>
                              {item.hint ? (
                                <span className="type-caption mt-0.5 block tracking-normal text-[var(--text-muted)]">
                                  {item.hint}
                                </span>
                              ) : null}
                            </span>
                            {isSelected ? (
                              <Check
                                size={14}
                                className="mt-0.5 shrink-0 text-[var(--primary)]"
                                aria-hidden
                              />
                            ) : null}
                          </button>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            portal,
          )
        : null}
    </div>
  );
}
