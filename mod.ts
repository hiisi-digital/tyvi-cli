/**
 * tyvi-cli - CLI interface for tyvi devspace orchestration
 *
 * This package provides a thin command-line interface that delegates
 * to the core `tyvi` library. All business logic lives in tyvi.
 *
 * @module
 */

import { main as cliMain } from "./src/cli.ts";

/**
 * Main CLI entry point
 */
export async function main(args?: string[]): Promise<number> {
  const cliArgs = args ?? Deno.args;
  return await cliMain(cliArgs);
}

// Run if executed directly
if (import.meta.main) {
  const exitCode = await main();
  Deno.exit(exitCode);
}
