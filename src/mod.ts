/**
 * CLI entry point and command router
 *
 * This module handles argument parsing, command routing,
 * and coordinates all CLI functionality.
 *
 * @module
 */

import { applyNoColor, bold, outputError, red, STATUS } from "./output.ts";

/**
 * Exit codes for different scenarios
 */
export const EXIT = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_ARGS: 2,
  CONFIG_ERROR: 3,
  GIT_ERROR: 4,
  PERMISSION_DENIED: 5,
};

/**
 * Global flags available to all commands
 */
export interface GlobalFlags {
  help: boolean; // -h, --help
  version: boolean; // -V, --version
  quiet: boolean; // -q, --quiet
  verbose: boolean; // -v, --verbose
  json: boolean; // --json
  noColor: boolean; // --no-color
}

/**
 * Simple argument parser result
 */
interface ParsedArgs {
  _: string[];
  [key: string]: unknown;
}

/**
 * Simple argument parser (minimal implementation)
 */
function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };
  const booleanFlags = new Set([
    "help",
    "version",
    "quiet",
    "verbose",
    "json",
    "no-color",
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) continue;

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (key.includes("=")) {
        const [k, v] = key.split("=", 2);
        if (k && v) {
          result[k] = v;
        }
      } else if (booleanFlags.has(key)) {
        // Known boolean flag
        result[key] = true;
      } else {
        // Check if next arg is a value or another flag
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith("-")) {
          result[key] = args[++i];
        } else {
          result[key] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      // Short flags
      const flags = arg.slice(1);
      for (const flag of flags) {
        // Map common short flags
        if (flag === "h") result["help"] = true;
        else if (flag === "V") result["version"] = true;
        else if (flag === "q") result["quiet"] = true;
        else if (flag === "v") result["verbose"] = true;
        else result[flag] = true;
      }
    } else {
      result._.push(arg);
    }
  }

  return result;
}

/**
 * Command handler function type
 */
type CommandHandler = (args: string[], flags: GlobalFlags) => Promise<number>;

/**
 * Show help text
 */
function helpCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  const helpText = `${bold("tyvi")} - Devspace orchestration CLI

${bold("Usage:")} tyvi <command> [options]

${bold("Commands:")}
  status          Show devspace status
  load <pattern>  Load repos to lab
  unload <pattern> Unload repos from lab
  clone <pattern> Clone repos to staging
  list            List repos from inventory
  
  person list     List all people
  person show     Show person details
  
  memory recall   Recall memories
  memory record   Record new memory
  
  context search  Search context
  context get     Get context by URI

${bold("Options:")}
  -h, --help      Show help
  -V, --version   Show version
  -q, --quiet     Minimal output
  -v, --verbose   Verbose output
  --json          JSON output
  --no-color      Disable colors`;

  console.log(helpText);
  return Promise.resolve(EXIT.SUCCESS);
}

/**
 * Show version
 */
function versionCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log("tyvi-cli 0.1.0");
  return Promise.resolve(EXIT.SUCCESS);
}

/**
 * Stub command for status (Phase 2)
 */
function statusCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log(red(`${STATUS.error} Command not yet implemented`));
  console.log("The 'status' command will be implemented in Phase 2");
  return Promise.resolve(EXIT.ERROR);
}

/**
 * Stub command for load (Phase 2)
 */
function loadCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log(red(`${STATUS.error} Command not yet implemented`));
  console.log("The 'load' command will be implemented in Phase 2");
  return Promise.resolve(EXIT.ERROR);
}

/**
 * Stub command for unload (Phase 2)
 */
function unloadCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log(red(`${STATUS.error} Command not yet implemented`));
  console.log("The 'unload' command will be implemented in Phase 2");
  return Promise.resolve(EXIT.ERROR);
}

/**
 * Stub command for clone (future phase)
 */
function cloneCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log(red(`${STATUS.error} Command not yet implemented`));
  console.log("The 'clone' command will be implemented in a future phase");
  return Promise.resolve(EXIT.ERROR);
}

/**
 * Stub command for list (future phase)
 */
function listCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  console.log(red(`${STATUS.error} Command not yet implemented`));
  console.log("The 'list' command will be implemented in a future phase");
  return Promise.resolve(EXIT.ERROR);
}

/**
 * Command registry
 */
const commands: Record<string, CommandHandler> = {
  help: helpCommand,
  version: versionCommand,
  status: statusCommand,
  load: loadCommand,
  unload: unloadCommand,
  clone: cloneCommand,
  list: listCommand,
};

/**
 * Parse command line arguments and route to appropriate command
 */
export async function main(args: string[]): Promise<number> {
  try {
    // Parse arguments
    const parsed = parseArgs(args);

    // Extract global flags
    const flags: GlobalFlags = {
      help: parsed.help === true,
      version: parsed.version === true,
      quiet: parsed.quiet === true,
      verbose: parsed.verbose === true,
      json: parsed.json === true,
      noColor: parsed["no-color"] === true,
    };

    // Apply noColor to Deno
    if (flags.noColor) {
      applyNoColor();
    }

    // Handle global flags
    if (flags.version) {
      return await versionCommand([], flags);
    }

    if (flags.help && parsed._.length === 0) {
      return await helpCommand([], flags);
    }

    // Get command and its args
    const commandName = parsed._[0]?.toString();
    const commandArgs = parsed._.slice(1).map(String);

    // No command provided
    if (!commandName) {
      return await helpCommand([], flags);
    }

    // Find and execute command
    const command = commands[commandName];
    if (!command) {
      console.error(red(`${STATUS.error} Unknown command: ${commandName}`));
      console.error(`Run 'tyvi --help' for usage information`);
      return EXIT.INVALID_ARGS;
    }

    // Show command help if requested
    if (flags.help) {
      // For now, just show general help
      return await helpCommand([], flags);
    }

    // Execute command
    return await command(commandArgs, flags);
  } catch (error) {
    outputError(error instanceof Error ? error : new Error(String(error)), {
      quiet: false,
      json: false,
    });
    return EXIT.ERROR;
  }
}
