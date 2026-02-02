/**
 * Common types for CLI
 */

export interface GlobalOptions {
  help?: boolean;
  version?: boolean;
  quiet?: boolean;
  json?: boolean;
  noColor?: boolean;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
}
