/**
 * Tests for CLI entry point
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { main } from "../mod.ts";

Deno.test("main - shows help with --help flag", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["--help"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "tyvi-cli");
    assertStringIncludes(stdout, "USAGE:");
    assertStringIncludes(stdout, "GLOBAL FLAGS:");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - shows version with --version flag", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["--version"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "tyvi-cli v");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - shows version with -V flag", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["-V"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "tyvi-cli v");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - returns exit code 2 for unknown command", async () => {
  let stderr = "";
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    stderr += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["unknown-command"]);
    assertEquals(exitCode, 2);
    assertStringIncludes(stderr, "Unknown command");
  } finally {
    console.error = originalError;
  }
});

Deno.test("main - returns exit code 2 when no command provided", async () => {
  let stderr = "";
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    stderr += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main([]);
    assertEquals(exitCode, 2);
    assertStringIncludes(stderr, "No command specified");
  } finally {
    console.error = originalError;
  }
});

Deno.test("main - init command executes successfully", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["init"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "Devspace initialized");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - status command executes successfully", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["status"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "Lab");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - status command with --json outputs JSON", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["status", "--json"]);
    assertEquals(exitCode, 0);
    // The output should contain valid JSON, even if there are stub messages
    assertStringIncludes(stdout, '"lab"');
    assertStringIncludes(stdout, '"staging"');
    assertStringIncludes(stdout, '"summary"');
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - list command executes successfully", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["list"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "repo(s)");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - load command requires pattern argument", async () => {
  let stderr = "";
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    stderr += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["load"]);
    assertEquals(exitCode, 2);
    assertStringIncludes(stderr, "Missing required argument");
  } finally {
    console.error = originalError;
  }
});

Deno.test("main - load command executes with pattern", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["load", "example-*"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "Loaded");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("main - add command requires url argument", async () => {
  let stderr = "";
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    stderr += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["add"]);
    assertEquals(exitCode, 2);
    assertStringIncludes(stderr, "Missing required argument");
  } finally {
    console.error = originalError;
  }
});

Deno.test("main - add command executes with url", async () => {
  let stdout = "";
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  };

  try {
    const exitCode = await main(["add", "https://github.com/example/repo.git"]);
    assertEquals(exitCode, 0);
    assertStringIncludes(stdout, "Added repo");
  } finally {
    console.log = originalLog;
  }
});
