/**
 * Output formatting utilities
 */

import { bold, green, red, yellow, gray } from "@std/fmt/colors";

let colorEnabled = true;
let quietMode = false;

export function setColorEnabled(enabled: boolean): void {
  colorEnabled = enabled;
}

export function setQuietMode(enabled: boolean): void {
  quietMode = enabled;
}

function maybeColor(text: string, colorFn: (s: string) => string): string {
  return colorEnabled ? colorFn(text) : text;
}

export function success(message: string): void {
  if (!quietMode) {
    console.log(`${maybeColor("✓", green)} ${message}`);
  }
}

export function warning(message: string): void {
  if (!quietMode) {
    console.log(`${maybeColor("!", yellow)} ${message}`);
  }
}

export function error(message: string): void {
  console.error(`${maybeColor("✗", red)} ${message}`);
}

export function info(message: string): void {
  if (!quietMode) {
    console.log(message);
  }
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printError(err: unknown): void {
  if (err instanceof Error) {
    error(err.message);
    if (err.stack && !quietMode) {
      console.error(maybeColor(err.stack, gray));
    }
  } else {
    error(String(err));
  }
}
