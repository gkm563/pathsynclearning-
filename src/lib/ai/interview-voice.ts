"use client";

import { isStartInterviewPhrase } from "./interview-variety";

export type InterviewMediaPrefs = {
  audioInputId: string;
  videoInputId: string;
  audioOutputId: string;
  speakReplies: boolean;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  autoListen: boolean;
};

export type MediaDeviceOption = {
  id: string;
  label: string;
};

const PREFS_KEY = "pathed.interview.media";

export function defaultInterviewMediaPrefs(): InterviewMediaPrefs {
  return {
    audioInputId: "",
    videoInputId: "",
    audioOutputId: "",
    speakReplies: true,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    autoListen: true,
  };
}

export function loadInterviewMediaPrefs(): InterviewMediaPrefs {
  const fallback = defaultInterviewMediaPrefs();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<InterviewMediaPrefs>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveInterviewMediaPrefs(prefs: InterviewMediaPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as typeof window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export async function listMediaDevices(): Promise<{
  audioInputs: MediaDeviceOption[];
  videoInputs: MediaDeviceOption[];
  audioOutputs: MediaDeviceOption[];
}> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return { audioInputs: [], videoInputs: [], audioOutputs: [] };
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  const labelFor = (device: MediaDeviceInfo, index: number, kind: string) =>
    device.label || `${kind} ${index + 1}`;
  return {
    audioInputs: devices
      .filter((d) => d.kind === "audioinput")
      .map((d, i) => ({ id: d.deviceId, label: labelFor(d, i, "Microphone") })),
    videoInputs: devices
      .filter((d) => d.kind === "videoinput")
      .map((d, i) => ({ id: d.deviceId, label: labelFor(d, i, "Camera") })),
    audioOutputs: devices
      .filter((d) => d.kind === "audiooutput")
      .map((d, i) => ({ id: d.deviceId, label: labelFor(d, i, "Speaker") })),
  };
}

export async function openInterviewMedia(
  prefs: InterviewMediaPrefs,
  opts: { video: boolean },
): Promise<MediaStream> {
  const audio: MediaTrackConstraints = {
    echoCancellation: prefs.echoCancellation,
    noiseSuppression: prefs.noiseSuppression,
    autoGainControl: prefs.autoGainControl,
  };
  if (prefs.audioInputId) audio.deviceId = { ideal: prefs.audioInputId };

  const video: boolean | MediaTrackConstraints = opts.video
    ? {
        width: { ideal: 640 },
        height: { ideal: 360 },
        ...(prefs.videoInputId ? { deviceId: { ideal: prefs.videoInputId } } : {}),
      }
    : false;

  try {
    return await navigator.mediaDevices.getUserMedia({ audio, video });
  } catch {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: opts.video,
    });
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export type LevelMonitor = {
  stop: () => void;
  resume: () => void;
};

export function attachLevelMonitor(
  stream: MediaStream,
  onLevel: (level: number) => void,
): LevelMonitor {
  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx || stream.getAudioTracks().length === 0) {
    onLevel(0);
    return { stop: () => undefined, resume: () => undefined };
  }
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;
  let alive = true;

  const tick = () => {
    if (!alive) return;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const sample of data) {
      const v = (sample - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    onLevel(Math.min(1, rms * 4));
    raf = window.requestAnimationFrame(tick);
  };
  void ctx.resume().then(() => {
    if (alive) tick();
  });

  return {
    stop: () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      source.disconnect();
      void ctx.close();
    },
    resume: () => {
      if (!alive) return;
      void ctx.resume();
    },
  };
}

export async function applyAudioOutput(
  element: HTMLMediaElement | null,
  deviceId: string,
) {
  if (!element || !deviceId) return;
  const media = element as HTMLMediaElement & {
    setSinkId?: (id: string) => Promise<void>;
  };
  if (typeof media.setSinkId === "function") {
    await media.setSinkId(deviceId);
  }
}

type RecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{
      isFinal: boolean;
      0?: { transcript?: string };
    }>;
  }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

export type InterviewRecognition = {
  start: () => boolean;
  stop: () => void;
  abort: () => void;
  pause: () => void;
  hearEnergy: (level: number) => void;
};

const SHORT_ANSWER = /^(yes|yeah|yep|yup|no|nope|nah|ok|okay|sure|ready|thanks|thank you)$/i;

function spokenWordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function commitDelayMs(text: string) {
  const words = spokenWordCount(text);
  const compact = text.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (isStartInterviewPhrase(compact)) return 1400;
  if (SHORT_ANSWER.test(compact)) return 2800;
  if (words <= 1) return 6500;
  if (words <= 3) return 5000;
  if (words <= 8) return 4000;
  return 3200;
}

export function createInterviewRecognition(handlers: {
  onTranscript: (finalText: string, interimText: string) => void;
  onCommit: (text: string) => void;
  onError: (message: string) => void;
  silenceMs?: number;
}): InterviewRecognition | null {
  const win = window as typeof window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  let wanted = false;
  let running = false;
  let finals: string[] = [];
  let lastInterim = "";
  let silenceTimer: number | null = null;
  let lastSpeechAt = 0;
  const silenceFloor = handlers.silenceMs ?? 3200;

  const currentText = () =>
    [finals.join(" "), lastInterim].filter(Boolean).join(" ").trim();

  const clearSilence = () => {
    if (silenceTimer != null) {
      window.clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  };

  const flush = (commit: boolean) => {
    const text = currentText();
    finals = [];
    lastInterim = "";
    lastSpeechAt = 0;
    if (commit && text.length >= 2) handlers.onCommit(text);
    else handlers.onTranscript("", "");
  };

  const scheduleCommit = () => {
    if (!wanted) return;
    const text = currentText();
    if (!text) {
      clearSilence();
      return;
    }
    clearSilence();
    const wait = Math.max(silenceFloor, commitDelayMs(text));
    silenceTimer = window.setTimeout(() => {
      silenceTimer = null;
      if (!wanted) return;
      const spoken = currentText();
      if (!spoken) return;
      if (Date.now() - lastSpeechAt < commitDelayMs(spoken) - 80) {
        scheduleCommit();
        return;
      }
      flush(true);
    }, wait);
  };

  rec.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i]?.[0]?.transcript?.trim() ?? "";
      if (!piece) continue;
      if (event.results[i].isFinal) finals.push(piece);
      else interim += (interim ? " " : "") + piece;
    }
    lastInterim = interim;
    lastSpeechAt = Date.now();
    handlers.onTranscript(finals.join(" ").trim(), interim);
    if (finals.length || interim) scheduleCommit();
  };

  rec.onerror = (event) => {
    const code = event.error || "";
    if (code === "aborted" || code === "no-speech" || code === "network") return;
    if (code === "not-allowed") {
      wanted = false;
      running = false;
      handlers.onError("Microphone permission denied. Allow it in the browser, then retry.");
      return;
    }
    if (code === "audio-capture") {
      wanted = false;
      running = false;
      handlers.onError("This microphone is busy or unavailable. Pick another in Settings.");
      return;
    }
  };

  rec.onend = () => {
    running = false;
    if (wanted) {
      if (currentText() && Date.now() - lastSpeechAt < 700) {
        lastSpeechAt = Date.now();
        scheduleCommit();
      }
      window.setTimeout(() => {
        if (!wanted || running) return;
        try {
          rec.start();
          running = true;
        } catch {
          /* next effect will retry */
        }
      }, 80);
      return;
    }
    clearSilence();
  };

  return {
    start: () => {
      wanted = true;
      if (running) return true;
      try {
        rec.start();
        running = true;
        return true;
      } catch (err) {
        const already =
          err instanceof DOMException && err.name === "InvalidStateError";
        if (already) {
          running = true;
          return true;
        }
        running = false;
        return false;
      }
    },
    hearEnergy: (level: number) => {
      if (!wanted || level < 0.05 || !currentText()) return;
      lastSpeechAt = Date.now();
    },
    stop: () => {
      wanted = false;
      clearSilence();
      try {
        rec.stop();
      } catch {
        flush(true);
      }
    },
    abort: () => {
      wanted = false;
      running = false;
      clearSilence();
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    },
    pause: () => {
      wanted = false;
      running = false;
      clearSilence();
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function createCopilotRecognition(handlers: {
  onSpeech: (text: string) => void;
  onCommit: (text: string) => void;
  onError: (message: string) => void;
}): InterviewRecognition | null {
  const win = window as typeof window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  let wanted = false;
  let running = false;
  let finals: string[] = [];
  let lastInterim = "";
  let silenceTimer: number | null = null;
  let restartTimer: number | null = null;

  const spokenNow = () => [finals.join(" "), lastInterim].filter(Boolean).join(" ").trim();

  const clearSilence = () => {
    if (silenceTimer != null) {
      window.clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  };

  const resetBuffer = () => {
    finals = [];
    lastInterim = "";
    clearSilence();
  };

  const kick = () => {
    if (!wanted || running) return;
    try {
      rec.start();
      running = true;
    } catch (err) {
      const already = err instanceof DOMException && err.name === "InvalidStateError";
      running = already;
      if (!already && restartTimer == null) {
        restartTimer = window.setTimeout(() => {
          restartTimer = null;
          kick();
        }, 400);
      }
    }
  };

  rec.onresult = (event) => {
    if (!wanted) return;
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i]?.[0]?.transcript?.trim() ?? "";
      if (!piece) continue;
      if (event.results[i].isFinal) finals.push(piece);
      else interim += (interim ? " " : "") + piece;
    }
    lastInterim = interim;
    const spoken = spokenNow();
    if (!spoken) return;
    handlers.onSpeech(spoken);
    clearSilence();
    silenceTimer = window.setTimeout(() => {
      silenceTimer = null;
      if (!wanted) return;
      const text = spokenNow();
      resetBuffer();
      if (text.length >= 2) handlers.onCommit(text);
    }, 700);
  };

  rec.onerror = (event) => {
    const code = event.error || "";
    if (code === "aborted" || code === "no-speech" || code === "network") return;
    running = false;
    if (code === "not-allowed") {
      wanted = false;
      handlers.onError("Microphone permission denied. Allow it in the browser, then retry.");
      return;
    }
    if (code === "audio-capture") {
      if (restartTimer == null) {
        restartTimer = window.setTimeout(() => {
          restartTimer = null;
          kick();
        }, 600);
      }
    }
  };

  rec.onend = () => {
    running = false;
    if (!wanted) {
      clearSilence();
      return;
    }
    restartTimer = window.setTimeout(() => {
      restartTimer = null;
      kick();
    }, 180);
  };

  return {
    start: () => {
      wanted = true;
      kick();
      return wanted;
    },
    hearEnergy: () => undefined,
    stop: () => {
      wanted = false;
      running = false;
      clearSilence();
      if (restartTimer != null) {
        window.clearTimeout(restartTimer);
        restartTimer = null;
      }
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    },
    abort: () => {
      wanted = false;
      running = false;
      resetBuffer();
      if (restartTimer != null) {
        window.clearTimeout(restartTimer);
        restartTimer = null;
      }
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    },
    pause: () => {
      wanted = false;
      running = false;
      resetBuffer();
      if (restartTimer != null) {
        window.clearTimeout(restartTimer);
        restartTimer = null;
      }
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function speakInterviewReply(
  text: string,
  handlers?: { onStart?: () => void; onEnd?: () => void },
) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
    handlers?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const spoken = text.trim();
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.rate = 1;
  utterance.pitch = 1;
  let finished = false;
  let started = false;
  const begunAt = Date.now();
  const done = () => {
    if (finished) return;
    if (!started && Date.now() - begunAt < 500) return;
    finished = true;
    window.clearTimeout(safety);
    window.clearTimeout(kickoff);
    handlers?.onEnd?.();
  };
  const safety = window.setTimeout(
    done,
    Math.min(28000, Math.max(4000, spoken.length * 85 + 2800)),
  );
  utterance.onstart = () => {
    started = true;
    handlers?.onStart?.();
  };
  utterance.onend = done;
  utterance.onerror = () => {
    if (started) done();
  };
  handlers?.onStart?.();
  const kickoff = window.setTimeout(() => {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, 80);
}
