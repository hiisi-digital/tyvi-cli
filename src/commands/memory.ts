/**
 * Memory commands
 */

import { cyan, dim } from "@std/fmt/colors";
import {
  formatStrength,
  printError,
  printInfo,
  printJson,
  printSuccess,
  printTable,
} from "../utils/output.ts";
import { promptText } from "../utils/prompts.ts";

// Types we expect from @hiisi/tyvi
interface Memory {
  id: string;
  person: string;
  topic?: string;
  content: string;
  strength: number; // 0-10
  timestamp: string;
}

interface RecallOptions {
  json?: boolean;
}

interface ListOptions {
  json?: boolean;
  person?: string;
  topic?: string;
}

/**
 * Recall memories for a person, optionally filtered by topic
 */
// deno-lint-ignore require-await
export async function recallCommand(
  person: string,
  topic: string | undefined,
  options: RecallOptions,
): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const memories = await recallMemories(person, topic);

    printInfo(`Recalling memories for: ${person}`);
    if (topic) {
      printInfo(`Topic filter: ${topic}`);
    }
    printInfo("Waiting for @hiisi/tyvi to export recallMemories()");

    // Mock data
    const memories: Memory[] = [
      {
        id: "mem-1",
        person,
        topic: topic || "general",
        content: "Prefers to work in the morning",
        strength: 8,
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "mem-2",
        person,
        topic: topic || "general",
        content: "Likes to pair program on complex tasks",
        strength: 6,
        timestamp: "2024-01-20T14:20:00Z",
      },
    ];

    if (options.json) {
      printJson(memories);
    } else {
      console.log();
      for (const memory of memories) {
        console.log(`${cyan(memory.id)} ${formatStrength(memory.strength)}`);
        console.log(`  ${memory.content}`);
        if (memory.topic) {
          console.log(`  ${dim(`Topic: ${memory.topic}`)}`);
        }
        console.log(`  ${dim(new Date(memory.timestamp).toLocaleString())}`);
        console.log();
      }
    }

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}

/**
 * Record a new memory interactively
 */
export async function recordCommand(person: string): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const memory = await recordMemory(person, content, topic);

    printInfo(`Recording memory for: ${person}`);
    printInfo("Waiting for @hiisi/tyvi to export recordMemory()");

    // Interactive prompts
    console.log();
    const content = await promptText("Memory content:");
    const topic = await promptText("Topic (optional):");

    if (!content) {
      printError("Memory content is required");
      return 1;
    }

    // Mock recording
    const memoryId = `mem-${Date.now()}`;
    console.log();
    printSuccess(`Memory recorded: ${cyan(memoryId)}`);
    console.log(`  Person: ${person}`);
    console.log(`  Content: ${content}`);
    if (topic) {
      console.log(`  Topic: ${topic}`);
    }

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}

/**
 * List all memories with optional filters
 */
// deno-lint-ignore require-await
export async function listCommand(options: ListOptions): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const memories = await listMemories(options);

    printInfo("Listing memories");
    if (options.person) {
      printInfo(`Filtered by person: ${options.person}`);
    }
    if (options.topic) {
      printInfo(`Filtered by topic: ${options.topic}`);
    }
    printInfo("Waiting for @hiisi/tyvi to export listMemories()");

    // Mock data
    const memories: Memory[] = [
      {
        id: "mem-1",
        person: "alice",
        topic: "work-style",
        content: "Prefers to work in the morning",
        strength: 8,
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "mem-2",
        person: "alice",
        topic: "collaboration",
        content: "Likes to pair program on complex tasks",
        strength: 6,
        timestamp: "2024-01-20T14:20:00Z",
      },
      {
        id: "mem-3",
        person: "bob",
        topic: "preferences",
        content: "Enjoys code reviews",
        strength: 7,
        timestamp: "2024-01-22T16:45:00Z",
      },
    ];

    // Apply filters
    let filtered = memories;
    if (options.person) {
      filtered = filtered.filter((m) => m.person === options.person);
    }
    if (options.topic) {
      filtered = filtered.filter((m) => m.topic === options.topic);
    }

    if (options.json) {
      printJson(filtered);
    } else {
      const headers = ["ID", "Person", "Topic", "Content", "Strength"];
      const rows = filtered.map((m) => [
        cyan(m.id),
        m.person,
        m.topic || dim("-"),
        m.content.substring(0, 40) + (m.content.length > 40 ? "..." : ""),
        formatStrength(m.strength),
      ]);
      printTable(headers, rows);
    }

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}
