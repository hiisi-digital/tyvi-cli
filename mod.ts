/**
 * tyvi-cli - CLI interface for tyvi devspace orchestration
 *
 * This package provides a thin command-line interface that delegates
 * to the core `tyvi` library. All business logic lives in tyvi.
 *
 * @module
 */

// Re-export CLI entry point
export { EXIT, main } from "./src/mod.ts";

// Run if executed directly
if (import.meta.main) {
  const { main } = await import("./src/mod.ts");
  const exitCode = await main(Deno.args);
  Deno.exit(exitCode);
}
