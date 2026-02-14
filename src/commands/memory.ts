/**
 * Memory commands
 * @module
 */

import { listMemories, pruneMemories, recallMemories, recordMemory, reinforceMemory } from "tyvi";
import type { MemoryInput } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { bold, formatTable, gray, green, output, red, STATUS, yellow } from "../output.ts";
import { input } from "../prompts.ts";

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
    case "reinforce":
      return await memoryReinforce(subargs, flags);
    case "prune":
      return await memoryPrune(subargs, flags);
    default:
      console.log(`${bold("tyvi memory")} - Memory management

${bold("Usage:")} tyvi memory <command> [args]

${bold("Commands:")}
  list [--person <id>] [--topic <topic>]   List memories
  recall <person> [topic]                   Recall memories for person
  record <person>                           Record new memory (interactive)
  reinforce <id>                            Reinforce a memory
  prune [--person <id>] [--threshold <n>]   Prune weak memories`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * List memories with optional filters
 */
async function memoryList(args: string[], flags: GlobalFlags): Promise<number> {
  try {
    const devspace = await resolveDevspace();

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

    const memories = await listMemories(devspace.rootPath, {
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
    const devspace = await resolveDevspace();
    const person = personId.startsWith("ctx://") ? personId : `ctx://person/${personId}`;

    const memories = await recallMemories(devspace.rootPath, {
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
    const person = personId.startsWith("ctx://") ? personId : `ctx://person/${personId}`;

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

    const devspace = await resolveDevspace();
    const memory = await recordMemory(devspace.rootPath, memoryInput);

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

/**
 * Reinforce a memory by ID
 */
async function memoryReinforce(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const memoryId = args[0];
  if (!memoryId) {
    console.error(red(`${STATUS.error} Missing memory ID`));
    console.error("Usage: tyvi memory reinforce <id> [reason]");
    return EXIT.INVALID_ARGS;
  }

  const reason = args.slice(1).join(" ") || "manual reinforcement";

  try {
    const devspace = await resolveDevspace();
    const result = await reinforceMemory(devspace.rootPath, memoryId, reason);

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(
      green(
        `${STATUS.success} Reinforced ${memoryId} (${result.previousStrength.toFixed(2)} -> ${
          result.newStrength.toFixed(2)
        })`,
      ),
    );
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} Failed to reinforce memory: ${error}`),
    );
    return EXIT.ERROR;
  }
}

/**
 * Prune weak memories
 */
async function memoryPrune(
  _args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const result = await pruneMemories(devspace.rootPath);

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(
      green(
        `${STATUS.success} Pruned ${result.pruned}/${result.checked} memories (threshold: ${
          result.threshold.toFixed(2)
        })`,
      ),
    );
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to prune memories: ${error}`));
    return EXIT.ERROR;
  }
}
