/**
 * Terminal output formatting utilities
 *
 * This module provides consistent output formatting for the CLI,
 * including colors, status indicators, tables, and various output modes.
 *
 * @module
 */

/**
 * ANSI color codes
 */
const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

/**
 * Status indicators with colors
 */
export const STATUS = {
  success: "✓", // green
  warning: "!", // yellow
  error: "✗", // red
  neutral: "-", // gray
  unknown: "?", // gray
};

/**
 * Check if colors should be disabled
 */
function shouldDisableColors(): boolean {
  return Deno.noColor || Deno.env.get("NO_COLOR") !== undefined;
}

/**
 * Apply no-color setting to Deno
 */
export function applyNoColor(): void {
  try {
    (Deno as { noColor: boolean }).noColor = true;
  } catch {
    // Ignore if readonly
  }
}

/**
 * Apply ANSI color code
 */
function applyColor(text: string, colorCode: string): string {
  if (shouldDisableColors()) {
    return text;
  }
  return `${colorCode}${text}${COLORS.reset}`;
}

/**
 * Format text in green
 */
export function green(text: string): string {
  return applyColor(text, COLORS.green);
}

/**
 * Format text in yellow
 */
export function yellow(text: string): string {
  return applyColor(text, COLORS.yellow);
}

/**
 * Format text in red
 */
export function red(text: string): string {
  return applyColor(text, COLORS.red);
}

/**
 * Format text in gray
 */
export function gray(text: string): string {
  return applyColor(text, COLORS.gray);
}

/**
 * Format text in bold
 */
export function bold(text: string): string {
  return applyColor(text, COLORS.bold);
}

/**
 * Configuration for a table column
 */
export interface TableColumn {
  header: string;
  key: string;
  align?: "left" | "right";
  width?: number;
}

/**
 * Format data as a table
 */
export function formatTable(
  rows: Record<string, unknown>[],
  columns: TableColumn[],
): string {
  if (rows.length === 0) {
    return "";
  }

  // Calculate column widths
  const widths = columns.map((col) => {
    const headerWidth = col.header.length;
    const maxDataWidth = rows.reduce((max, row) => {
      const value = String(row[col.key] ?? "");
      return Math.max(max, value.length);
    }, 0);
    return col.width ?? Math.max(headerWidth, maxDataWidth);
  });

  // Format a row
  const formatRow = (data: Record<string, unknown>): string => {
    return columns.map((col, i) => {
      const value = String(data[col.key] ?? "");
      const width = widths[i] ?? 0;
      if (col.align === "right") {
        return value.padStart(width);
      }
      return value.padEnd(width);
    }).join("  ");
  };

  // Build table
  const lines: string[] = [];

  // Header
  const header = columns.map((col, i) => col.header.padEnd(widths[i] ?? 0))
    .join("  ");
  lines.push(bold(header));

  // Separator
  const separator = columns.map((_, i) => "-".repeat(widths[i] ?? 0)).join(
    "  ",
  );
  lines.push(gray(separator));

  // Rows
  rows.forEach((row) => {
    lines.push(formatRow(row));
  });

  return lines.join("\n");
}

/**
 * Output options for controlling format
 */
export interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
  noColor?: boolean;
}

/**
 * Output data in the appropriate format
 */
export function output(data: unknown, options: OutputOptions = {}): void {
  // Apply noColor option
  if (options.noColor) {
    try {
      (Deno as { noColor: boolean }).noColor = true;
    } catch {
      // Ignore if readonly
    }
  }

  // Quiet mode: no output
  if (options.quiet) {
    return;
  }

  // JSON mode
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Default: convert to string and print
  if (typeof data === "string") {
    console.log(data);
  } else if (typeof data === "object" && data !== null) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(String(data));
  }
}

/**
 * Output an error in the appropriate format
 */
export function outputError(error: Error, options: OutputOptions = {}): void {
  // Apply noColor option
  if (options.noColor) {
    try {
      (Deno as { noColor: boolean }).noColor = true;
    } catch {
      // Ignore if readonly
    }
  }

  // Quiet mode: no output
  if (options.quiet) {
    return;
  }

  // JSON mode
  if (options.json) {
    console.error(JSON.stringify(
      {
        error: error.message,
        name: error.name,
        stack: error.stack,
      },
      null,
      2,
    ));
    return;
  }

  // Default: formatted error
  console.error(red(`${STATUS.error} Error: ${error.message}`));

  // Show stack in verbose scenarios
  if (error.stack) {
    console.error(gray(error.stack));
  }
}
