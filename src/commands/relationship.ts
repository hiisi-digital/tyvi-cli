/**
 * Relationship commands
 * @module
 */

import {
  addRelationshipLogEntry,
  listRelationships,
  loadRelationships,
} from "tyvi";
import type { RelationshipLogEntry } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import {
  bold,
  formatTable,
  gray,
  green,
  output,
  red,
  STATUS,
  yellow,
} from "../output.ts";
import { input } from "../prompts.ts";

/**
 * Handle relationship subcommands
 */
export async function relationshipCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "list":
      return await relationshipList(subargs, flags);
    case "show":
      return await relationshipShow(subargs, flags);
    case "log":
      return await relationshipLog(subargs, flags);
    default:
      console.log(`${bold("tyvi relationship")} - Relationship management

${bold("Usage:")} tyvi relationship <command> [args]

${bold("Commands:")}
  list [--person <id>] [--type <type>] [--all]   List relationships
  show <person>                                     Show relationships for person
  log <person> <with> [--event <type>]             Add relationship log entry`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * List relationships with optional filters
 */
async function relationshipList(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();

    let person: string | undefined;
    let type: string | undefined;
    let includeInactive = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--person" && args[i + 1]) {
        person = args[++i];
      } else if (args[i] === "--type" && args[i + 1]) {
        type = args[++i];
      } else if (args[i] === "--all") {
        includeInactive = true;
      }
    }

    const relationships = await listRelationships(devspace.rootPath, {
      person,
      type: type as Parameters<typeof listRelationships>[1] extends
        { type?: infer T } ? T : never,
      includeInactive,
    });

    if (relationships.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No relationships found"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(relationships, { json: true });
      return EXIT.SUCCESS;
    }

    const table = formatTable(
      relationships.map((r) => ({
        person: r.withId,
        type: r.type,
        status: r.status === "active"
          ? green(r.status)
          : r.status === "dormant"
          ? yellow(r.status)
          : gray(r.status),
        since: r.since,
        summary: r.summary.slice(0, 40) + (r.summary.length > 40 ? "..." : ""),
      })),
      [
        { header: "Person", key: "person" },
        { header: "Type", key: "type" },
        { header: "Status", key: "status" },
        { header: "Since", key: "since" },
        { header: "Summary", key: "summary" },
      ],
    );
    console.log(table);

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} Failed to list relationships: ${error}`),
    );
    return EXIT.ERROR;
  }
}

/**
 * Show relationships for a specific person
 */
async function relationshipShow(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const personId = args[0];
  if (!personId) {
    console.error(red(`${STATUS.error} Missing person ID`));
    console.error("Usage: tyvi relationship show <person>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const devspace = await resolveDevspace();
    const collection = await loadRelationships(devspace.rootPath, personId);

    if (collection.relationships.length === 0) {
      if (!flags.quiet) {
        console.log(gray(`No relationships found for ${personId}`));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(collection, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(`Relationships for ${personId}:`));
    console.log();

    for (const rel of collection.relationships) {
      const withId = rel.with.replace("ctx://person/", "");
      const statusColor = rel.status === "active"
        ? green
        : rel.status === "dormant"
        ? yellow
        : gray;

      console.log(`  ${bold(withId)} (${rel.type})`);
      console.log(
        `    Status: ${statusColor(rel.status)}  Since: ${rel.since}`,
      );
      console.log(`    ${rel.dynamic.summary}`);

      if (rel.dynamic.strengths?.length) {
        console.log(
          gray(`    Strengths: ${rel.dynamic.strengths.join(", ")}`),
        );
      }
      if (rel.dynamic.friction?.length) {
        console.log(
          gray(`    Friction: ${rel.dynamic.friction.join(", ")}`),
        );
      }
      if (rel.log?.length) {
        console.log(gray(`    Log entries: ${rel.log.length}`));
      }
      console.log();
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} Failed to show relationships: ${error}`),
    );
    return EXIT.ERROR;
  }
}

/**
 * Add a log entry to a relationship (interactive)
 */
async function relationshipLog(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const personId = args[0];
  const withId = args[1];

  if (!personId || !withId) {
    console.error(red(`${STATUS.error} Missing person ID or with ID`));
    console.error("Usage: tyvi relationship log <person> <with>");
    return EXIT.INVALID_ARGS;
  }

  try {
    // Parse event type from args or prompt
    let eventArg: string | undefined;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--event" && args[i + 1]) {
        eventArg = args[++i];
      }
    }

    const event = eventArg ?? await input(
      "Event type (collaboration/tension/resolution/growth/milestone/shift)",
      "collaboration",
    );

    const note = await input("Note");
    if (!note) {
      console.error(red(`${STATUS.error} Note is required`));
      return EXIT.INVALID_ARGS;
    }

    const impactStr = await input(
      "Impact (positive/negative/neutral)",
      "neutral",
    );

    const logEntry: RelationshipLogEntry = {
      timestamp: new Date().toISOString(),
      event: event as RelationshipLogEntry["event"],
      note,
      impact: impactStr as "positive" | "negative" | "neutral",
    };

    const devspace = await resolveDevspace();
    await addRelationshipLogEntry(
      devspace.rootPath,
      personId,
      withId,
      logEntry,
    );

    if (flags.json) {
      output(logEntry, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(green(`${STATUS.success} Log entry added`));
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} Failed to add log entry: ${error}`),
    );
    return EXIT.ERROR;
  }
}
