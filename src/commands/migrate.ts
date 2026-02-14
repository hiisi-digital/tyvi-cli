/**
 * Interactive migration command.
 *
 * Walks a source directory, prompts the user for each entry,
 * and migrates git repos/dirs/files into the tyvi devspace.
 *
 * @module
 */

import { deleteEntry, migrateRepo, scanDirectory } from "tyvi";
import type { DiscoveredEntry } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { confirm, input, select } from "../prompts.ts";
import { bold, gray, green, output, red, STATUS, yellow } from "../output.ts";

/**
 * Format entry type for display.
 */
function formatEntryType(entry: DiscoveredEntry): string {
  switch (entry.type) {
    case "git-repo":
      return green("git repo");
    case "tyvi-project":
      return yellow("tyvi project");
    case "directory":
      return gray("directory");
    case "file":
      return gray("file");
  }
}

/**
 * Show entry details for migration prompt.
 */
function showEntryDetails(entry: DiscoveredEntry): void {
  console.log();
  console.log(
    `${bold(entry.name)}  ${formatEntryType(entry)}`,
  );
  console.log(gray(`  ${entry.path}`));

  if (entry.git) {
    if (entry.git.currentBranch) {
      console.log(gray(`  Branch: ${entry.git.currentBranch}`));
    }
    if (entry.git.gitStatus) {
      console.log(gray(`  Status: ${entry.git.gitStatus}`));
    }
    for (const remote of entry.git.remotes) {
      console.log(gray(`  Remote ${remote.name}: ${remote.url}`));
    }
    if (entry.git.suggestedNamespace) {
      console.log(
        gray(`  Suggested namespace: ${entry.git.suggestedNamespace}`),
      );
    }
  }
}

/**
 * Handle the migrate command.
 */
export async function migrateCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    // Parse source path from -i/--input, default to cwd
    let sourcePath: string | undefined;
    for (let i = 0; i < args.length; i++) {
      if ((args[i] === "-i" || args[i] === "--input") && args[i + 1]) {
        sourcePath = args[++i];
      }
    }

    const strategy = args.includes("--move") ? "move" : "copy";

    // Resolve devspace first
    const devspace = await resolveDevspace();
    const source = sourcePath ?? Deno.cwd();

    // Confirm source
    console.log(bold(`Migrate from: ${source}`));
    console.log(
      bold(
        `Into devspace: ${devspace.config.devspace.name} (${devspace.rootPath})`,
      ),
    );
    console.log(bold(`Strategy: ${strategy}`));
    console.log();

    const proceed = await confirm("Continue?");
    if (!proceed) {
      console.log(gray("Cancelled"));
      return EXIT.SUCCESS;
    }

    // Scan directory
    console.log();
    console.log(gray("Scanning..."));
    const scan = await scanDirectory(source, devspace);

    // Report auto-skipped
    if (scan.autoSkipped.length > 0) {
      console.log();
      console.log(
        gray(
          `Auto-skipped ${scan.autoSkipped.length} internal/retained entries:`,
        ),
      );
      for (const entry of scan.autoSkipped) {
        const reason = entry.isTyviInternal ? "tyvi internal" : "retained";
        console.log(gray(`  ${entry.name} (${reason})`));
      }
    }

    if (scan.actionable.length === 0) {
      console.log();
      console.log(green(`${STATUS.success} Nothing to migrate`));
      return EXIT.SUCCESS;
    }

    console.log();
    console.log(
      bold(`Found ${scan.actionable.length} entries to process:`),
    );

    // Counters
    let imported = 0;
    let deleted = 0;
    let skipped = 0;
    let failed = 0;

    // Process each entry
    for (const entry of scan.actionable) {
      showEntryDetails(entry);

      // Tyvi projects: skip by default
      if (entry.type === "tyvi-project") {
        const action = await select("Action?", [
          "skip (recommended)",
          "merge into current devspace",
        ]);

        if (action === "skip (recommended)") {
          console.log(gray(`  Skipped`));
          skipped++;
          continue;
        }

        // Merge is complex — for now, just skip with a note
        console.log(
          yellow(
            `  ${STATUS.warning} Merge is not yet implemented, skipping`,
          ),
        );
        skipped++;
        continue;
      }

      // Git repos: import, delete, or skip
      if (entry.type === "git-repo") {
        const action = await select("Action?", [
          "import to staging",
          "delete",
          "skip",
        ]);

        if (action === "skip") {
          skipped++;
          continue;
        }

        if (action === "delete") {
          const yes = await confirm(
            `  Delete ${entry.name}? This is permanent.`,
          );
          if (yes) {
            const result = await deleteEntry(entry.path);
            if (result.action === "deleted") {
              console.log(red(`  Deleted`));
              deleted++;
            } else {
              console.log(red(`  ${STATUS.error} ${result.error}`));
              failed++;
            }
          } else {
            skipped++;
          }
          continue;
        }

        // Import: determine namespace
        const suggested = entry.git?.suggestedNamespace ??
          devspace.config.devspace.namespaces?.default ?? "@default";
        const namespace = await input("  Namespace", suggested);

        const result = await migrateRepo(devspace, {
          sourcePath: entry.path,
          namespace,
          strategy,
        });

        if (result.action === "imported") {
          console.log(
            green(
              `  ${STATUS.success} Imported to ${result.namespace}`,
            ),
          );
          imported++;
        } else {
          console.log(red(`  ${STATUS.error} ${result.error}`));
          failed++;
        }
        continue;
      }

      // Plain directories and files: import, delete, or skip
      const action = await select("Action?", [
        "delete",
        "skip",
      ]);

      if (action === "skip") {
        skipped++;
        continue;
      }

      if (action === "delete") {
        const yes = await confirm(
          `  Delete ${entry.name}? This is permanent.`,
        );
        if (yes) {
          const result = await deleteEntry(entry.path);
          if (result.action === "deleted") {
            console.log(red(`  Deleted`));
            deleted++;
          } else {
            console.log(red(`  ${STATUS.error} ${result.error}`));
            failed++;
          }
        } else {
          skipped++;
        }
      }
    }

    // Summary
    console.log();
    console.log(bold("Migration complete:"));
    if (imported > 0) console.log(green(`  ${imported} imported`));
    if (deleted > 0) console.log(red(`  ${deleted} deleted`));
    if (skipped > 0) console.log(gray(`  ${skipped} skipped`));
    if (failed > 0) console.log(red(`  ${failed} failed`));

    if (flags.json) {
      output({ imported, deleted, skipped, failed }, { json: true });
    }

    return failed > 0 ? EXIT.ERROR : EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} ${error instanceof Error ? error.message : error}`,
      ),
    );
    return EXIT.ERROR;
  }
}
