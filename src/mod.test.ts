/**
 * Tests for CLI entry point
 */

import { EXIT, main } from "./mod.ts";

// Simple assertion helper
function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected} but got ${actual}`,
    );
  }
}

Deno.test("main shows help with no args", async () => {
  const exitCode = await main([]);
  assertEquals(exitCode, EXIT.SUCCESS);
});

Deno.test("main shows help with --help", async () => {
  const exitCode = await main(["--help"]);
  assertEquals(exitCode, EXIT.SUCCESS);
});

Deno.test("main shows help with -h", async () => {
  const exitCode = await main(["-h"]);
  assertEquals(exitCode, EXIT.SUCCESS);
});

Deno.test("main shows version with --version", async () => {
  const exitCode = await main(["--version"]);
  assertEquals(exitCode, EXIT.SUCCESS);
});

Deno.test("main shows version with -V", async () => {
  const exitCode = await main(["-V"]);
  assertEquals(exitCode, EXIT.SUCCESS);
});

Deno.test("main returns error for unknown command", async () => {
  const exitCode = await main(["unknown-command"]);
  assertEquals(exitCode, EXIT.INVALID_ARGS);
});

Deno.test("main handles status command (stub)", async () => {
  const exitCode = await main(["status"]);
  assertEquals(exitCode, EXIT.ERROR);
});

Deno.test("main handles load command (stub)", async () => {
  const exitCode = await main(["load", "pattern"]);
  assertEquals(exitCode, EXIT.ERROR);
});

Deno.test("main handles unload command (stub)", async () => {
  const exitCode = await main(["unload", "pattern"]);
  assertEquals(exitCode, EXIT.ERROR);
});

Deno.test("main handles global flags", async () => {
  // Test that global flags are parsed without error
  const exitCode1 = await main(["--quiet", "--version"]);
  assertEquals(exitCode1, EXIT.SUCCESS);

  const exitCode2 = await main(["--json", "--version"]);
  assertEquals(exitCode2, EXIT.SUCCESS);

  const exitCode3 = await main(["--no-color", "--version"]);
  assertEquals(exitCode3, EXIT.SUCCESS);
});

Deno.test("main handles flags before command", async () => {
  const exitCode = await main(["--quiet", "status"]);
  assertEquals(exitCode, EXIT.ERROR); // Status is stub, returns error
});

Deno.test("main handles flags after command", async () => {
  const exitCode = await main(["status", "--quiet"]);
  assertEquals(exitCode, EXIT.ERROR); // Status is stub, returns error
});
