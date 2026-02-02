/**
 * tyvi-cli - CLI interface for tyvi devspace orchestration
 *
 * This package provides a thin command-line interface that delegates
 * to the core `tyvi` library. All business logic lives in tyvi.
 *
 * @module
 */

// Re-export CLI entry point (to be implemented)
// export { main } from "./src/mod.ts";

/**
 * Placeholder until implementation.
 *
 * TODO: Implement CLI with:
 * - Argument parsing via @std/cli
 * - Command routing to tyvi core
 * - Output formatting for terminal
 */
export function main(): void {
  console.log("tyvi-cli - not yet implemented");
  console.log("See docs/TODO.md for implementation tasks");
}

// Run if executed directly
if (import.meta.main) {
  main();
}
