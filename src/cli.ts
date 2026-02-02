/**
 * CLI entry point with argument parsing and command routing
 */

import { parseArgs } from "@std/cli/parse-args";
import { error, info, setColorEnabled, setQuietMode } from "./output.ts";
import type { GlobalOptions } from "./types.ts";

// Import commands
import * as devspace from "./commands/devspace.ts";
import * as repo from "./commands/repo.ts";

const VERSION = "0.1.0";

function showHelp(): void {
  console.log(`
tyvi-cli v${VERSION}
CLI interface for tyvi devspace orchestration

USAGE:
  tyvi <command> [options] [args]

GLOBAL FLAGS:
  -h, --help         Show help
  -V, --version      Show version
  -q, --quiet        Minimal output
  --json             JSON output mode
  --no-color         Disable colors

DEVSPACE COMMANDS:
  init               Initialize a new devspace
  status             Show devspace status
  load <pattern>     Load repos from staging to lab
  unload <pattern>   Unload repos from lab to staging
  clone <pattern>    Clone repos to staging
  sync               Sync devspace with inventory

REPO COMMANDS:
  list               List repos from inventory
  add <url>          Add repo to inventory
  remove <name>      Remove repo from inventory

EXAMPLES:
  tyvi init
  tyvi status --json
  tyvi load @hiisi/*
  tyvi clone example-repo
  tyvi list --loaded

For more information, see: https://github.com/hiisi-digital/tyvi-cli
`);
}

function showVersion(): void {
  console.log(`tyvi-cli v${VERSION}`);
}

function parseGlobalOptions(args: ReturnType<typeof parseArgs>): GlobalOptions {
  return {
    help: args.h || args.help,
    version: args.V || args.version,
    quiet: args.q || args.quiet,
    json: args.json,
    noColor: args["no-color"],
  };
}

function applyGlobalOptions(options: GlobalOptions): void {
  if (options.noColor) {
    setColorEnabled(false);
  }
  if (options.quiet) {
    setQuietMode(true);
  }
}

export async function main(args: string[]): Promise<number> {
  // Parse arguments
  const parsed = parseArgs(args, {
    boolean: [
      "help",
      "h",
      "version",
      "V",
      "quiet",
      "q",
      "json",
      "no-color",
      "loaded",
      "fetch",
    ],
    string: ["root", "namespace"],
    alias: {
      h: "help",
      V: "version",
      q: "quiet",
    },
    "--": true,
  });

  const globalOptions = parseGlobalOptions(parsed);

  // Handle global flags
  if (globalOptions.version) {
    showVersion();
    return 0;
  }

  if (globalOptions.help && parsed._.length === 0) {
    showHelp();
    return 0;
  }

  // Apply global options
  applyGlobalOptions(globalOptions);

  // Get command
  const command = parsed._[0]?.toString();

  if (!command) {
    error("No command specified");
    info("Run 'tyvi --help' for usage information");
    return 2;
  }

  // Route to command handlers
  try {
    switch (command) {
      // Devspace commands
      case "init":
        return await devspace.init({
          ...globalOptions,
          root: parsed.root,
        });

      case "status":
        return await devspace.status({
          ...globalOptions,
          root: parsed.root,
        });

      case "load": {
        const pattern = parsed._[1]?.toString();
        if (!pattern) {
          error("Missing required argument: <pattern>");
          return 2;
        }
        return await devspace.load({
          ...globalOptions,
          pattern,
          root: parsed.root,
        });
      }

      case "unload": {
        const pattern = parsed._[1]?.toString();
        if (!pattern) {
          error("Missing required argument: <pattern>");
          return 2;
        }
        return await devspace.unload({
          ...globalOptions,
          pattern,
          root: parsed.root,
        });
      }

      case "clone": {
        const pattern = parsed._[1]?.toString();
        if (!pattern) {
          error("Missing required argument: <pattern>");
          return 2;
        }
        return await devspace.clone({
          ...globalOptions,
          pattern,
          root: parsed.root,
        });
      }

      case "sync":
        return await devspace.sync({
          ...globalOptions,
          root: parsed.root,
          fetch: parsed.fetch,
        });

      // Repo commands
      case "list":
        return await repo.list({
          ...globalOptions,
          root: parsed.root,
          loaded: parsed.loaded,
        });

      case "add": {
        const url = parsed._[1]?.toString();
        if (!url) {
          error("Missing required argument: <url>");
          return 2;
        }
        return await repo.add({
          ...globalOptions,
          url,
          namespace: parsed.namespace,
        });
      }

      case "remove": {
        const name = parsed._[1]?.toString();
        if (!name) {
          error("Missing required argument: <name>");
          return 2;
        }
        return await repo.remove({
          ...globalOptions,
          name,
        });
      }

      default:
        error(`Unknown command: ${command}`);
        info("Run 'tyvi --help' for usage information");
        return 2;
    }
  } catch (err) {
    error(`Command failed: ${err}`);
    return 1;
  }
}
