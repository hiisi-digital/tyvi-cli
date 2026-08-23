/**
 * Viola convention linter configuration for tyvi-cli.
 *
 * Checks for code duplication, naming conventions, documentation gaps,
 * and file organization problems.
 */

import { report, viola, when } from "jsr:@hiisi/viola@^0.3.1";
import defaultLints from "jsr:@hiisi/viola-default-lints@^0.3.2";
import tsGrammar from "jsr:@hiisi/viola-grammar-ts@^0.3.2";

export default viola()
  .add(tsGrammar).as("ts")
  .use(defaultLints)
  // Suppress all lint issues in test files
  .rule(report.off, when.in("tests/**"))
  .rule(report.off, when.in("**/*.test.ts"))
  // Shell completion templates have intentional string duplication
  .rule(
    report.off,
    when.in("src/commands/completions.ts").and(
      when.linter("duplicate-strings"),
    ),
  )
  // Orphaned code: mark public API files
  .set("orphaned-code", {
    publicApiFiles: [
      "mod.ts",
      "src/mod.ts",
      "src/commands/devspace.ts",
      "src/commands/migrate.ts",
      "src/commands/person.ts",
      "src/commands/memory.ts",
      "src/commands/context.ts",
      "src/commands/atoms.ts",
      "src/commands/relationship.ts",
      "src/commands/guards.ts",
      "src/commands/completions.ts",
      "src/output.ts",
      "src/prompts.ts",
      "src/devspace.ts",
    ],
  })
  // Similar functions: CLI commands are intentionally similar in structure
  .set("similar-functions", {
    ignoreFunctions: [
      "atomsList",
      "memoryList",
      "memoryRecall",
      "memoryRecord",
      "memoryReinforce",
      "memoryPrune",
      "relationshipList",
      "relationshipShow",
      "relationshipLog",
      "guardsSetup",
      "guardsValidate",
      "guardsStatus",
      "repoAdd",
      "repoRemove",
    ],
  })
  // Duplicate strings: ignore common CLI patterns
  .set("duplicate-strings", {
    ignoreStrings: [
      "tyvi",
      "--all",
      "--force",
      "--namespace",
      "EXIT.SUCCESS",
      "EXIT.ERROR",
      "EXIT.INVALID_ARGS",
    ],
  });
