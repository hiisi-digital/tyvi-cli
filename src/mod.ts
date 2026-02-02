/**
 * CLI entry point with command routing
 */

import { parseArgs } from "@std/cli/parse-args";
import { printError, printInfo } from "./utils/output.ts";
import * as personCommands from "./commands/person.ts";
import * as memoryCommands from "./commands/memory.ts";

const VERSION = "0.1.0";

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
tyvi-cli v${VERSION}

USAGE:
  tyvi <command> [options] [args]

COMMANDS:
  Person Commands:
    person list              List all people
    person show <id>         Show person with computed values
    person compute <id>      Show derivation trace for person

  Memory Commands:
    memory recall <person> [topic]   Recall memories for person
    memory record <person>            Record a new memory
    memory list                       List all memories

GLOBAL OPTIONS:
  --help, -h        Show this help message
  --version, -V     Show version
  --json            Output in JSON format
  --quiet, -q       Minimal output
  --verbose, -v     Verbose output

EXAMPLES:
  tyvi person list
  tyvi person show alice
  tyvi person compute alice
  tyvi memory recall alice collaboration
  tyvi memory record alice
  tyvi memory list --person alice --topic work-style
  `);
}

/**
 * Parse and route commands
 */
export async function main(args: string[]): Promise<number> {
  const parsed = parseArgs(args, {
    boolean: ["help", "version", "json", "quiet", "verbose", "trace"],
    string: ["person", "topic"],
    alias: {
      h: "help",
      V: "version",
      q: "quiet",
      v: "verbose",
    },
  });

  // Handle global flags
  if (parsed.help) {
    showHelp();
    return 0;
  }

  if (parsed.version) {
    console.log(`tyvi-cli v${VERSION}`);
    return 0;
  }

  const [command, subcommand, ...rest] = parsed._;
  const commandStr = String(command || "");
  const subcommandStr = String(subcommand || "");

  // Route person commands
  if (commandStr === "person") {
    if (subcommandStr === "list") {
      return await personCommands.listCommand({
        json: parsed.json,
      });
    }

    if (subcommandStr === "show") {
      const id = String(rest[0] || "");
      if (!id) {
        printError("Missing required argument: <id>");
        return 2;
      }
      return await personCommands.showCommand(id, {
        json: parsed.json,
      });
    }

    if (subcommandStr === "compute") {
      const id = String(rest[0] || "");
      if (!id) {
        printError("Missing required argument: <id>");
        return 2;
      }
      return await personCommands.computeCommand(id, {
        trace: parsed.trace,
      });
    }

    printError(`Unknown person subcommand: ${subcommandStr}`);
    printInfo("Try: tyvi person list|show|compute");
    return 2;
  }

  // Route memory commands
  if (commandStr === "memory") {
    if (subcommandStr === "recall") {
      const person = String(rest[0] || "");
      if (!person) {
        printError("Missing required argument: <person>");
        return 2;
      }
      const topic = rest[1] ? String(rest[1]) : undefined;
      return await memoryCommands.recallCommand(person, topic, {
        json: parsed.json,
      });
    }

    if (subcommandStr === "record") {
      const person = String(rest[0] || "");
      if (!person) {
        printError("Missing required argument: <person>");
        return 2;
      }
      return await memoryCommands.recordCommand(person);
    }

    if (subcommandStr === "list") {
      return await memoryCommands.listCommand({
        json: parsed.json,
        person: parsed.person,
        topic: parsed.topic,
      });
    }

    printError(`Unknown memory subcommand: ${subcommandStr}`);
    printInfo("Try: tyvi memory recall|record|list");
    return 2;
  }

  // No valid command
  if (!commandStr) {
    showHelp();
    return 0;
  }

  printError(`Unknown command: ${commandStr}`);
  printInfo("Try: tyvi --help");
  return 2;
}
