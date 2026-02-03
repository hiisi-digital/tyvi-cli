/**
 * Memory commands
 * @module
 */

import {
  listMemories,
  recallMemories,
  recordMemory,
} from "tyvi";
import type { MemoryInput } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import {
  formatTable,
  green,
  yellow,
  red,
  gray,
  bold,
  output,
  STATUS,
} from "../output.ts";
import { input } from "../prompts.ts";

/**
 * Find devspace data path
 */
function getDataPath(): string {
  const home = Deno.env.get("HOME") || ".";
  return `${home}/.ctl`;
}

/**
 * Format strength as visual indicator
 */
function formatStrength(strength: number): string {
  if (strength >= 0.8) return green("███");
  if (strength >= 0.5) return yellow("██░");
  if (strength >= 0.2) return yellow("█░░");
  return gray("░░░");
}

/**
 * Handle memory subcommands
 */
export async function memoryCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "list":
      return await memoryList(subargs, flags);
    case "recall":
      return await memoryRecall(subargs, flags);
    case "record":
      return await memoryRecord(subargs, flags);
    default:
      console.log(`${bold("tyvi memory")} - Memory management

${bold("Usage:")} tyvi memory <command> [args]

${bold("Commands:")}
  list [--person <id>] [--topic <topic>]   List memories
  recall <person> [topic]                   Recall memories for person
  record <person>                           Record new memory (interactive)`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * List memories with optional filters
 */
async function memoryList(args: string[], flags: GlobalFlags): Promise<number> {
  try {
    const dataPath = getDataPath();

    // Parse filter args
    let person: string | undefined;
    let topic: string | undefined;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--person" && args[i + 1]) {
        person = args[++i];
      } else if (args[i] === "--topic" && args[i + 1]) {
        topic = args[++i];
      }
    }

    const memories = await listMemories(dataPath, {
      person,
      topic,
      includeWeak: true,
    });

    if (memories.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No memories found"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(memories, { json: true });
      return EXIT.SUCCESS;
    }

    const table = formatTable(
      memories.map((m) => ({
        strength: formatStrength(m.strength),
        person: m.person.split("/").pop() || m.person,
        summary: m.summary.slice(0, 40) + (m.summary.length > 40 ? "..." : ""),
        topics: m.topics.slice(0, 2).join(", "),
      })),
      [
        { header: "Str", key: "strength", width: 3 },
        { header: "Person", key: "person" },
        { header: "Summary", key: "summary" },
        { header: "Topics", key: "topics" },
      ],
    );
    console.log(table);
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to list memories: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Recall memories for a person
 */
async function memoryRecall(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const personId = args[0];
  if (!personId) {
    console.error(red(`${STATUS.error} Missing person ID`));
    console.error("Usage: tyvi memory recall <person> [topic]");
    return EXIT.INVALID_ARGS;
  }

  const topic = args[1];

  try {
    const dataPath = getDataPath();
    const person = personId.startsWith("ctx://")
      ? personId
      : `ctx://person/${personId}`;

    const memories = await recallMemories(dataPath, {
      person,
      topic,
      limit: 10,
    });

    if (memories.length === 0) {
      if (!flags.quiet) {
        console.log(gray(`No memories found for ${personId}`));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(memories, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(`Memories for ${personId}:`));
    console.log();

    for (const memory of memories) {
      const strength = formatStrength(memory.strength.current);
      console.log(`${strength} ${bold(memory.content.summary)}`);
      if (memory.content.detail) {
        console.log(gray(`   ${memory.content.detail}`));
      }
      console.log(gray(`   Topics: ${memory.tags.topics.join(", ")}`));
      console.log();
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to recall memories: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Record a new memory (interactive)
 */
async function memoryRecord(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const personId = args[0];
  if (!personId) {
    console.error(red(`${STATUS.error} Missing person ID`));
    console.error("Usage: tyvi memory record <person>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const person = personId.startsWith("ctx://")
      ? personId
      : `ctx://person/${personId}`;

    // Interactive prompts
    const summary = await input("Summary");
    const detail = await input("Detail (optional)", "");
    const significance = await input(
      "Significance (low/medium/high)",
      "medium",
    );
    const topicsStr = await input("Topics (comma-separated)");
    const topics = topicsStr.split(",").map((t) => t.trim()).filter(Boolean);

    if (!summary) {
      console.error(red(`${STATUS.error} Summary is required`));
      return EXIT.INVALID_ARGS;
    }

    const memoryInput: MemoryInput = {
      person,
      content: {
        summary,
        detail: detail || undefined,
        significance: significance as "low" | "medium" | "high",
      },
      tags: {
        topics,
        people: [],
      },
    };

    const dataPath = getDataPath();
    const memory = await recordMemory(dataPath, memoryInput);

    if (flags.json) {
      output(memory, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(green(`${STATUS.success} Memory recorded: ${memory.id}`));
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to record memory: ${error}`));
    return EXIT.ERROR;
  }
}
