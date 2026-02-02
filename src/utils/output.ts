/**
 * Output formatting utilities for terminal display
 */

import { bold, cyan, gray, green, red, yellow } from "@std/fmt/colors";

/**
 * Status indicators
 */
export const STATUS = {
  success: green("✓"),
  warning: yellow("!"),
  error: red("✗"),
  none: gray("-"),
  unknown: gray("?"),
} as const;

/**
 * Print a table with aligned columns
 */
export function printTable(
  headers: string[],
  rows: string[][],
  options?: { spacing?: number },
): void {
  const spacing = options?.spacing ?? 2;

  // Calculate column widths
  const widths = headers.map((header, i) => {
    const cellWidths = rows.map((row) => stripAnsi(row[i] || "").length);
    return Math.max(header.length, ...cellWidths);
  });

  // Print header
  const headerRow = headers
    .map((h, i) => bold(h.padEnd(widths[i]!)))
    .join(" ".repeat(spacing));
  console.log(headerRow);
  console.log(gray("─".repeat(headerRow.length)));

  // Print rows
  for (const row of rows) {
    const rowStr = row
      .map((cell, i) => {
        const plain = stripAnsi(cell);
        const padding = widths[i]! - plain.length;
        return cell + " ".repeat(padding);
      })
      .join(" ".repeat(spacing));
    console.log(rowStr);
  }
}

/**
 * Print JSON output
 */
export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Print an error message
 */
export function printError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${STATUS.error} ${red(message)}`);
}

/**
 * Print a success message
 */
export function printSuccess(message: string): void {
  console.log(`${STATUS.success} ${message}`);
}

/**
 * Print an info message
 */
export function printInfo(message: string): void {
  console.log(`${cyan("ℹ")} ${message}`);
}

/**
 * Strip ANSI color codes from a string
 */
function stripAnsi(str: string): string {
  // deno-lint-ignore no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Format a strength indicator (0-10) as a visual bar
 */
export function formatStrength(strength: number): string {
  const bars = Math.round(strength);
  const filled = "█".repeat(bars);
  const empty = "░".repeat(10 - bars);
  return gray(empty) + yellow(filled);
}
