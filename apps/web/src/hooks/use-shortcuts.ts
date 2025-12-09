"use client";

import { useEffect } from "react";
import { tinykeys } from "./tinykeys";
import type { KeyBindingMap, Options } from "./tinykeys";

export function useShortcuts(keyBindingMap: KeyBindingMap, options?: Options) {
  useEffect(() => {
    return tinykeys(window, keyBindingMap, options);
  }, [keyBindingMap, options]);
}
