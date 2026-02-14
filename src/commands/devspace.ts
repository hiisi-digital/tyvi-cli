/**
 * Devspace commands (init, status, load, unload, clone, list)
 * @module
 */

import {
  addRepo,
  checkGitAllowed,
  clone,
  findDevspaceRoot,
  getBlockedMessage,
  getStatus,
  initDevspace,
  listRepos,
  load,
  removeRepo,
  sync,
  unload,
} from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { confirm, input } from "../prompts.ts";
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

// ============================================================================
// init
// ============================================================================

export async function initCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const targetDir = args[0] ?? ".";

    // Prompt for name
    const name = await input("Devspace name", "my-devspace");

    // Prompt for namespaces
    const nsInput = await input("Namespaces (comma-separated)", "@default");
    const namespaces = nsInput.split(",").map((s) => s.trim()).filter(Boolean);

    const result = await initDevspace(targetDir, {
      name,
      namespaces,
    });

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(
      green(`${STATUS.success} Devspace initialized at ${result.rootPath}`),
    );
    console.log(gray(`  Config: ${result.configPath}`));
    console.log(gray(`  Created: ${result.created.join(", ")}`));

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to init: ${
          error instanceof Error ? error.message : error
        }`,
      ),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// status
// ============================================================================

function formatGitStatus(status?: string): string {
  switch (status) {
    case "clean":
      return green("clean");
    case "dirty":
      return red("dirty");
    case "ahead":
      return yellow("ahead");
    case "behind":
      return yellow("behind");
    case "diverged":
      return red("diverged");
    default:
      return gray("-");
  }
}

function formatCloneStatus(status: string): string {
  switch (status) {
    case "cloned":
      return green("cloned");
    case "missing":
      return gray("missing");
    case "partial":
      return yellow("partial");
    default:
      return gray(status);
  }
}

export async function statusCommand(
  _args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const repos = await getStatus(devspace);

    if (repos.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No repositories in devspace"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(repos, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(`Devspace: ${devspace.config.devspace.name}`));
    console.log();

    const table = formatTable(
      repos.map((r) => ({
        namespace: r.namespace,
        name: r.name,
        clone: formatCloneStatus(r.cloneStatus),
        git: formatGitStatus(r.gitStatus),
        branch: r.currentBranch ?? "-",
        sync: r.ahead !== undefined
          ? `${r.ahead ? yellow(`+${r.ahead}`) : ""}${
            r.behind ? red(`-${r.behind}`) : ""
          }`
          : "-",
      })),
      [
        { header: "Namespace", key: "namespace" },
        { header: "Name", key: "name" },
        { header: "Clone", key: "clone" },
        { header: "Git", key: "git" },
        { header: "Branch", key: "branch" },
        { header: "Sync", key: "sync" },
      ],
    );
    console.log(table);

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// list
// ============================================================================

export async function listCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const repos = await listRepos(devspace);

    if (repos.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No repositories in devspace"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(repos, { json: true });
      return EXIT.SUCCESS;
    }

    // Check for --short/-s flag
    const isShort = args.includes("--short") || args.includes("-s");

    if (isShort) {
      for (const repo of repos) {
        console.log(`${repo.namespace}/${repo.name}`);
      }
      return EXIT.SUCCESS;
    }

    const table = formatTable(
      repos.map((r) => ({
        namespace: r.namespace,
        name: r.name,
        status: r.status ?? "-",
        clone: formatCloneStatus(r.cloneStatus),
        loaded: r.loaded ? green("loaded") : gray("-"),
        category: r.category ?? "-",
      })),
      [
        { header: "Namespace", key: "namespace" },
        { header: "Name", key: "name" },
        { header: "Status", key: "status" },
        { header: "Clone", key: "clone" },
        { header: "Loaded", key: "loaded" },
        { header: "Category", key: "category" },
      ],
    );
    console.log(table);

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// load
// ============================================================================

export async function loadCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const pattern = args[0];
    const all = args.includes("--all");
    const namespace = args.find((_a, i) => args[i - 1] === "--namespace");

    if (!pattern && !all && !namespace) {
      console.error(red(`${STATUS.error} Missing pattern or --all flag`));
      console.error("Usage: tyvi load <pattern> | --all | --namespace <ns>");
      return EXIT.INVALID_ARGS;
    }

    const devspace = await resolveDevspace();
    const result = await load(devspace, { pattern, namespace, all });

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    for (const name of result.loaded) {
      console.log(green(`${STATUS.success} Loaded ${name}`));
    }

    for (const name of result.alreadyLoaded) {
      console.log(gray(`${STATUS.neutral} Already loaded: ${name}`));
    }

    for (const { name, error } of result.failed) {
      console.log(red(`${STATUS.error} Failed to load ${name}: ${error}`));
    }

    if (
      result.loaded.length === 0 && result.alreadyLoaded.length === 0 &&
      result.failed.length === 0
    ) {
      console.log(gray("No matching repos found"));
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// unload
// ============================================================================

export async function unloadCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const pattern = args[0];
    const all = args.includes("--all");
    const force = args.includes("--force") || args.includes("-f");

    if (!pattern && !all) {
      console.error(red(`${STATUS.error} Missing pattern or --all flag`));
      console.error("Usage: tyvi unload <pattern> | --all [--force]");
      return EXIT.INVALID_ARGS;
    }

    const devspace = await resolveDevspace();
    const result = await unload(devspace, { pattern, all, force });

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    for (const name of result.unloaded) {
      console.log(green(`${STATUS.success} Unloaded ${name}`));
    }

    for (const { name, reason } of result.refused) {
      console.log(
        red(`${STATUS.error} Refused to unload ${name}: ${reason}`),
      );
    }

    if (result.unloaded.length === 0 && result.refused.length === 0) {
      console.log(gray("No matching loaded repos found"));
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// clone
// ============================================================================

export async function cloneCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const pattern = args[0];
    const all = args.includes("--all");
    const namespace = args.find((_a, i) => args[i - 1] === "--namespace");
    const category = args.find((_a, i) => args[i - 1] === "--category");

    if (!pattern && !all && !namespace && !category) {
      console.error(red(`${STATUS.error} Missing pattern or filter flag`));
      console.error(
        "Usage: tyvi clone <pattern> | --all | --namespace <ns> | --category <cat>",
      );
      return EXIT.INVALID_ARGS;
    }

    const devspace = await resolveDevspace();
    const result = await clone(devspace, {
      pattern,
      namespace,
      category,
      all,
      showProgress: !flags.quiet,
    });

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    for (const name of result.cloned) {
      console.log(green(`${STATUS.success} Cloned ${name}`));
    }

    for (const name of result.skipped) {
      console.log(gray(`${STATUS.neutral} Already cloned: ${name}`));
    }

    for (const name of result.failed) {
      console.log(red(`${STATUS.error} Failed to clone ${name}`));
    }

    if (
      result.cloned.length === 0 && result.skipped.length === 0 &&
      result.failed.length === 0
    ) {
      console.log(gray("No matching repos found"));
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// repo add / repo remove
// ============================================================================

export async function repoCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "add":
      return await repoAdd(subargs, flags);
    case "remove":
    case "rm":
      return await repoRemove(subargs, flags);
    default:
      console.log(`${bold("tyvi repo")} - Repository management

${bold("Usage:")} tyvi repo <command> [args]

${bold("Commands:")}
  add <url> [--namespace <ns>] [--name <n>] [--category <cat>]
  remove <name> [--delete-files]`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

async function repoAdd(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const url = args[0];
  if (!url) {
    console.error(red(`${STATUS.error} Missing repository URL`));
    console.error("Usage: tyvi repo add <url> [--namespace <ns>]");
    return EXIT.INVALID_ARGS;
  }

  try {
    const namespace = args.find((_a, i) => args[i - 1] === "--namespace");
    const name = args.find((_a, i) => args[i - 1] === "--name");
    const category = args.find((_a, i) => args[i - 1] === "--category");

    const devspace = await resolveDevspace();
    await addRepo(devspace, url, { namespace, name, category });

    const repoName = name || url.split("/").pop()?.replace(/\.git$/, "") ||
      "repo";

    if (flags.json) {
      output({ name: repoName, url, namespace }, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(green(`${STATUS.success} Added ${repoName} to inventory`));
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to add repo: ${
          error instanceof Error ? error.message : error
        }`,
      ),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// sync
// ============================================================================

export async function syncCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const fetch = args.includes("--fetch");
    const prune = args.includes("--prune");
    const dryRun = args.includes("--dry-run");

    const devspace = await resolveDevspace();
    const result = await sync(devspace, { fetch, prune, dryRun });

    if (flags.json) {
      output(result, { json: true });
      return EXIT.SUCCESS;
    }

    for (const name of result.created) {
      console.log(green(`${STATUS.success} Created ${name}`));
    }

    for (const name of result.fetched) {
      console.log(green(`${STATUS.success} Fetched ${name}`));
    }

    for (const name of result.orphaned) {
      console.log(yellow(`${STATUS.warning} Orphaned: ${name}`));
    }

    if (
      result.created.length === 0 && result.fetched.length === 0 &&
      result.orphaned.length === 0
    ) {
      console.log(gray("Everything up to date"));
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// check-git-allowed
// ============================================================================

export async function checkGitAllowedCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const path = args[0] ?? Deno.cwd();
    const devspace = await resolveDevspace();
    const result = checkGitAllowed(devspace, path);

    if (flags.json) {
      output(result, { json: true });
      return result.allowed ? EXIT.SUCCESS : EXIT.GIT_ERROR;
    }

    if (result.allowed) {
      if (!flags.quiet) {
        console.log(green(`${STATUS.success} Git allowed (${result.reason})`));
      }
      return EXIT.SUCCESS;
    }

    if (!flags.quiet) {
      console.log(getBlockedMessage(devspace, path));
    }
    return EXIT.GIT_ERROR;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// hint
// ============================================================================

export async function hintCommand(
  _args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const labPath = devspace.config.devspace.lab_path ?? ".lab";

    if (flags.json) {
      output({
        name: devspace.config.devspace.name,
        root: devspace.rootPath,
        labPath,
        namespaces: devspace.config.devspace.namespaces?.paths ?? [],
      }, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(`Devspace: ${devspace.config.devspace.name}`));
    console.log(`  Root: ${devspace.rootPath}`);
    console.log(`  Lab: ${labPath}`);
    console.log(
      `  Namespaces: ${
        (devspace.config.devspace.namespaces?.paths ?? []).join(", ")
      }`,
    );
    console.log();
    console.log(bold("Quick commands:"));
    console.log(`  tyvi status          Show repo status`);
    console.log(`  tyvi list -s         List repos (short)`);
    console.log(`  tyvi load <pattern>  Load repo to lab`);
    console.log(`  tyvi clone --all     Clone all repos`);

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(`${STATUS.error} ${error instanceof Error ? error.message : error}`),
    );
    return EXIT.ERROR;
  }
}

// ============================================================================
// root
// ============================================================================

export async function rootCommand(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  const root = await findDevspaceRoot(Deno.cwd());
  if (root) {
    console.log(root);
    return EXIT.SUCCESS;
  }
  return EXIT.ERROR;
}

// ============================================================================
// repo add / repo remove
// ============================================================================

async function repoRemove(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const repoName = args[0];
  if (!repoName) {
    console.error(red(`${STATUS.error} Missing repository name`));
    console.error("Usage: tyvi repo remove <name> [--delete-files]");
    return EXIT.INVALID_ARGS;
  }

  try {
    const deleteFiles = args.includes("--delete-files");

    if (deleteFiles) {
      const yes = await confirm(
        `Delete files for ${repoName} from disk?`,
      );
      if (!yes) {
        console.log(gray("Cancelled"));
        return EXIT.SUCCESS;
      }
    }

    const devspace = await resolveDevspace();
    const removed = await removeRepo(devspace, repoName, { deleteFiles });

    if (flags.json) {
      output({ name: repoName, removed }, { json: true });
      return EXIT.SUCCESS;
    }

    if (removed) {
      console.log(
        green(`${STATUS.success} Removed ${repoName} from inventory`),
      );
    } else {
      console.log(red(`${STATUS.error} Repository ${repoName} not found`));
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to remove repo: ${
          error instanceof Error ? error.message : error
        }`,
      ),
    );
    return EXIT.ERROR;
  }
}
