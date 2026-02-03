/**
 * Tests for output utilities
 */

import {
  bold,
  formatTable,
  gray,
  green,
  output,
  outputError,
  red,
  STATUS,
  type TableColumn,
  yellow,
} from "./output.ts";

// Simple assertion helpers
function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected} but got ${actual}`,
    );
  }
}

function assertExists<T>(value: T): void {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to exist but got ${value}`);
  }
}

Deno.test("STATUS constants exist", () => {
  assertExists(STATUS.success);
  assertExists(STATUS.warning);
  assertExists(STATUS.error);
  assertExists(STATUS.neutral);
  assertExists(STATUS.unknown);
});

Deno.test("color functions work", () => {
  // With colors enabled
  const originalEnv = Deno.env.get("NO_COLOR");
  Deno.env.delete("NO_COLOR");

  const greenText = green("test");
  const yellowText = yellow("test");
  const redText = red("test");
  const grayText = gray("test");
  const boldText = bold("test");

  // Should contain ANSI codes when colors enabled (or be plain text if NO_COLOR)
  // We can't easily test this in a deterministic way, so just check they return strings
  assertEquals(typeof greenText, "string");
  assertEquals(typeof yellowText, "string");
  assertEquals(typeof redText, "string");
  assertEquals(typeof grayText, "string");
  assertEquals(typeof boldText, "string");

  // Restore env
  if (originalEnv !== undefined) {
    Deno.env.set("NO_COLOR", originalEnv);
  }
});

Deno.test("color functions respect NO_COLOR env", () => {
  // Set NO_COLOR
  const originalEnv = Deno.env.get("NO_COLOR");
  Deno.env.set("NO_COLOR", "1");

  const greenText = green("test");
  const yellowText = yellow("test");
  const redText = red("test");

  // Should not contain ANSI codes when NO_COLOR is set
  assertEquals(greenText, "test");
  assertEquals(yellowText, "test");
  assertEquals(redText, "test");

  // Restore
  if (originalEnv !== undefined) {
    Deno.env.set("NO_COLOR", originalEnv);
  } else {
    Deno.env.delete("NO_COLOR");
  }
});

Deno.test("formatTable formats data correctly", () => {
  const rows = [
    { name: "Alice", age: 30, city: "NYC" },
    { name: "Bob", age: 25, city: "LA" },
  ];

  const columns: TableColumn[] = [
    { header: "Name", key: "name" },
    { header: "Age", key: "age", align: "right" },
    { header: "City", key: "city" },
  ];

  const table = formatTable(rows, columns);

  // Should contain headers
  assertEquals(table.includes("Name"), true);
  assertEquals(table.includes("Age"), true);
  assertEquals(table.includes("City"), true);

  // Should contain data
  assertEquals(table.includes("Alice"), true);
  assertEquals(table.includes("Bob"), true);
});

Deno.test("formatTable handles empty rows", () => {
  const columns: TableColumn[] = [
    { header: "Name", key: "name" },
  ];

  const table = formatTable([], columns);
  assertEquals(table, "");
});

Deno.test("output handles quiet mode", () => {
  // This test just ensures quiet mode doesn't throw
  output("test", { quiet: true });
  assertEquals(true, true);
});

Deno.test("output handles JSON mode", () => {
  // This test just ensures JSON mode doesn't throw
  output({ test: "data" }, { json: true });
  assertEquals(true, true);
});

Deno.test("outputError handles errors", () => {
  const error = new Error("Test error");

  // This test just ensures outputError doesn't throw
  outputError(error, { quiet: true });
  assertEquals(true, true);
});
