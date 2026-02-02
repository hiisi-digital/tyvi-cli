/**
 * Devspace commands: init, status, load, unload, clone, sync
 */

import * as tyvi from "../tyvi-stub.ts";
import { error, info, printJson, success, warning } from "../output.ts";
import type { GlobalOptions } from "../types.ts";

export interface InitOptions extends GlobalOptions {
  root?: string;
}

export async function init(options: InitOptions): Promise<number> {
  try {
    await tyvi.initDevspace({ root: options.root });

    if (options.json) {
      printJson({ success: true, message: "Devspace initialized" });
    } else {
      success("Devspace initialized");
      info("Created .tyvi directory structure");
      info("Run 'tyvi status' to see devspace status");
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to initialize devspace: ${err}`);
    }
    return 1;
  }
}

export interface StatusOptions extends GlobalOptions {
  root?: string;
}

export async function status(options: StatusOptions): Promise<number> {
  try {
    const devspaceStatus = await tyvi.getDevspaceStatus({ root: options.root });

    if (options.json) {
      printJson(devspaceStatus);
    } else {
      info("Lab (.lab/):");
      if (devspaceStatus.lab.length === 0) {
        info("  (empty)");
      } else {
        // Calculate max name length for alignment
        const maxNameLength = Math.max(
          ...devspaceStatus.lab.map((r) => r.name.length),
        );
        for (const repo of devspaceStatus.lab) {
          const statusIcon = repo.status === "clean" ? "✓" : "!";
          const statusText = repo.status === "clean" ? "clean" : "dirty";
          const padding = " ".repeat(maxNameLength - repo.name.length + 1);
          info(
            `  ${repo.name}${padding}${statusIcon} ${statusText} (${repo.branch})`,
          );
        }
      }

      info("");
      info("Staging:");
      const namespaces = Object.keys(devspaceStatus.staging);
      if (namespaces.length === 0) {
        info("  (empty)");
      } else {
        for (const ns of namespaces) {
          const data = devspaceStatus.staging[ns];
          if (data) {
            info(`  ${ns} (${data.total} repos, ${data.loaded} loaded)`);
          }
        }
      }

      info("");
      info(
        `Summary: ${devspaceStatus.summary.loaded} loaded, ${devspaceStatus.summary.dirty} dirty, ${devspaceStatus.summary.total} total`,
      );
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to get status: ${err}`);
    }
    return 1;
  }
}

export interface LoadOptions extends GlobalOptions {
  pattern: string;
  root?: string;
}

export async function load(options: LoadOptions): Promise<number> {
  try {
    const loaded = await tyvi.loadRepos(options.pattern, {
      root: options.root,
    });

    if (options.json) {
      printJson({ success: true, loaded });
    } else {
      if (loaded.length === 0) {
        warning("No repos matched pattern");
      } else {
        success(`Loaded ${loaded.length} repo(s) to lab:`);
        for (const repo of loaded) {
          info(`  - ${repo}`);
        }
      }
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to load repos: ${err}`);
    }
    return 1;
  }
}

export interface UnloadOptions extends GlobalOptions {
  pattern: string;
  root?: string;
}

export async function unload(options: UnloadOptions): Promise<number> {
  try {
    const unloaded = await tyvi.unloadRepos(options.pattern, {
      root: options.root,
    });

    if (options.json) {
      printJson({ success: true, unloaded });
    } else {
      if (unloaded.length === 0) {
        warning("No repos matched pattern");
      } else {
        success(`Unloaded ${unloaded.length} repo(s) from lab:`);
        for (const repo of unloaded) {
          info(`  - ${repo}`);
        }
      }
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to unload repos: ${err}`);
    }
    return 1;
  }
}

export interface CloneOptions extends GlobalOptions {
  pattern: string;
  root?: string;
}

export async function clone(options: CloneOptions): Promise<number> {
  try {
    const cloned = await tyvi.cloneRepos(options.pattern, {
      root: options.root,
    });

    if (options.json) {
      printJson({ success: true, cloned });
    } else {
      if (cloned.length === 0) {
        warning("No repos matched pattern");
      } else {
        success(`Cloned ${cloned.length} repo(s) to staging:`);
        for (const repo of cloned) {
          info(`  - ${repo}`);
        }
      }
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to clone repos: ${err}`);
    }
    return 1;
  }
}

export interface SyncOptions extends GlobalOptions {
  root?: string;
  fetch?: boolean;
}

export async function sync(options: SyncOptions): Promise<number> {
  try {
    const result = await tyvi.syncDevspace({
      root: options.root,
      fetch: options.fetch,
    });

    if (options.json) {
      printJson({ success: true, ...result });
    } else {
      if (result.added.length === 0 && result.removed.length === 0) {
        info("Devspace is already in sync");
      } else {
        success("Devspace synced");
        if (result.added.length > 0) {
          info(`Added ${result.added.length} repo(s):`);
          for (const repo of result.added) {
            info(`  + ${repo}`);
          }
        }
        if (result.removed.length > 0) {
          info(`Removed ${result.removed.length} repo(s):`);
          for (const repo of result.removed) {
            info(`  - ${repo}`);
          }
        }
      }
    }

    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to sync devspace: ${err}`);
    }
    return 1;
  }
}
