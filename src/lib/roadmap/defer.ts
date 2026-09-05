const STORAGE_KEY = "pathed:roadmap-deferred";

export function isRoadmapDeferred(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRoadmapDeferred(deferred: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (deferred) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
}
