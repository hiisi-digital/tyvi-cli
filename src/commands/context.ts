/**
 * Context commands
 * @module
 */

import { parseUri, resolveContext, searchContext } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { bold, formatTable, gray, green, output, red, STATUS } from "../output.ts";

/**
 * Handle context subcommands
 */
export async function contextCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "get":
      return await contextGet(subargs, flags);
    case "search":
      return await contextSearch(subargs, flags);
    case "parse":
      return await contextParse(subargs, flags);
    default:
      console.log(`${bold("tyvi context")} - Context management

${bold("Usage:")} tyvi context <command> [args]

${bold("Commands:")}
  get <uri>         Resolve a ctx:// URI
  search <query>    Search context
  parse <uri>       Parse and validate a ctx:// URI`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * Get/resolve a context URI
 */
async function contextGet(args: string[], flags: GlobalFlags): Promise<number> {
  const uri = args[0];
  if (!uri) {
    console.error(red(`${STATUS.error} Missing URI`));
    console.error("Usage: tyvi context get <uri>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const devspace = await resolveDevspace();
    const result = await resolveContext(devspace.rootPath, uri);

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold("Resolved Context:"));
    console.log();
    console.log(`${bold("URI:")} ${result.uri}`);
    console.log(`${bold("Type:")} ${result.parsed.type}`);
    console.log(
      `${bold("Scope:")} ${result.resolvedAt.level}${
        result.resolvedAt.org ? `/${result.resolvedAt.org}` : ""
      }${result.resolvedAt.team ? `/${result.resolvedAt.team}` : ""}`,
    );
    console.log();

    if (result.content) {
      console.log(bold("Content:"));
      if (typeof result.content === "string") {
        console.log(result.content);
      } else {
        console.log(JSON.stringify(result.content, null, 2));
      }
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to resolve context: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Search context
 */
async function contextSearch(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const query = args.join(" ");
  if (!query) {
    console.error(red(`${STATUS.error} Missing search query`));
    console.error("Usage: tyvi context search <query>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const devspace = await resolveDevspace();
    const results = await searchContext(devspace.rootPath, {
      query,
      limit: 10,
    });

    if (results.results.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No results found"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(results, { json: true });
      return EXIT.SUCCESS;
    }

    const table = formatTable(
      results.results.map((r) => ({
        uri: r.uri,
        type: r.type,
        score: r.score?.toFixed(2) || "-",
      })),
      [
        { header: "URI", key: "uri" },
        { header: "Type", key: "type" },
        { header: "Score", key: "score", align: "right" },
      ],
    );
    console.log(table);
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to search context: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Parse a context URI
 */
function contextParse(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const uri = args[0];
  if (!uri) {
    console.error(red(`${STATUS.error} Missing URI`));
    console.error("Usage: tyvi context parse <uri>");
    return Promise.resolve(EXIT.INVALID_ARGS);
  }

  try {
    const parsed = parseUri(uri);

    if (flags.json) {
      output(parsed, { json: true });
      return Promise.resolve(EXIT.SUCCESS);
    }

    console.log(green(`${STATUS.success} Valid ctx:// URI`));
    console.log();
    console.log(`${bold("Scheme:")} ${parsed.scheme}`);
    console.log(`${bold("Type:")} ${parsed.type}`);
    console.log(`${bold("Path:")} ${parsed.path}`);

    return Promise.resolve(EXIT.SUCCESS);
  } catch (error) {
    console.error(red(`${STATUS.error} Invalid URI: ${error}`));
    return Promise.resolve(EXIT.INVALID_ARGS);
  }
}
