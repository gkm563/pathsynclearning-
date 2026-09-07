"use client";

import { useEffect, useRef, useState } from "react";

const KEYBOARD_INSET_PX = 140;

type VirtualKeyboardNav = {
  boundingRect: { height: number };
  addEventListener: (type: "geometrychange", fn: () => void) => void;
  removeEventListener: (type: "geometrychange", fn: () => void) => void;
};

/**
 * Detects the on-screen keyboard. Pass `inputOpen` (editor focused) so the
 * resting viewport height is frozen while typing — Android resizes layout
 * with the keyboard, which would otherwise look like "no inset".
 */
export function useVirtualKeyboard(inputOpen = false) {
  const [inset, setInset] = useState(0);
  const restHeightRef = useRef(0);
  const inputOpenRef = useRef(inputOpen);
  inputOpenRef.current = inputOpen;

  useEffect(() => {
    const vv = window.visualViewport;
    const vk = (navigator as Navigator & { virtualKeyboard?: VirtualKeyboardNav })
      .virtualKeyboard;

    restHeightRef.current = Math.max(window.innerHeight, vv?.height ?? 0);

    const measure = () => {
      const layoutH = window.innerHeight;
      const vvH = Math.round(vv?.height ?? layoutH);
      const vvInset = vv
        ? Math.max(0, Math.round(layoutH - vv.height - vv.offsetTop))
        : 0;
      const vkH = Math.round(vk?.boundingRect.height ?? 0);

      if (!inputOpenRef.current) {
        restHeightRef.current = Math.max(restHeightRef.current, layoutH, vvH);
      }

      const rest = restHeightRef.current || layoutH;
      const next = Math.max(vvInset, vkH, rest - layoutH, rest - vvH);
      setInset(Math.max(0, Math.round(next)));
    };

    const onOrientation = () => {
      restHeightRef.current = 0;
      measure();
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", onOrientation);
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);
    vk?.addEventListener("geometrychange", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", onOrientation);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
      vk?.removeEventListener("geometrychange", measure);
    };
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    const layoutH = window.innerHeight;
    const vvH = Math.round(vv?.height ?? layoutH);
    if (!inputOpen) {
      restHeightRef.current = Math.max(restHeightRef.current, layoutH, vvH);
    }
    const rest = restHeightRef.current || layoutH;
    const vvInset = vv
      ? Math.max(0, Math.round(layoutH - vv.height - vv.offsetTop))
      : 0;
    setInset(Math.max(0, Math.round(Math.max(vvInset, rest - layoutH, rest - vvH))));
  }, [inputOpen]);

  return {
    inset,
    open: inset >= KEYBOARD_INSET_PX,
  };
}
