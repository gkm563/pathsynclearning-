/** Shared copilot UI-interaction types — safe for client and server. */

export type CopilotUiKind = "link" | "button" | "tab" | "input";

export type CopilotUiSnapshotItem = {
  id: string;
  label: string;
  kind: CopilotUiKind;
  href?: string;
};

export type CopilotInteract = {
  type: "click";
  id?: string;
  label?: string;
  href?: string;
};
