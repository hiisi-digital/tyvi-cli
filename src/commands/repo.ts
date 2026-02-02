/**
 * Repo commands: list, add, remove
 */

import * as tyvi from "../tyvi-stub.ts";
import { success, error, info, printJson } from "../output.ts";
import type { GlobalOptions } from "../types.ts";

export interface ListOptions extends GlobalOptions {
  root?: string;
  loaded?: boolean;
}

export async function list(options: ListOptions): Promise<number> {
  try {
    const repos = await tyvi.listRepos({ root: options.root, loaded: options.loaded });
    
    if (options.json) {
      printJson(repos);
    } else {
      if (repos.length === 0) {
        info("No repos in inventory");
      } else {
        info(`Found ${repos.length} repo(s):`);
        info("");
        for (const repo of repos) {
          const loadedText = repo.loaded ? "✓ loaded" : "  ";
          const namespace = repo.namespace ? `[${repo.namespace}]` : "";
          info(`  ${loadedText} ${repo.name} ${namespace}`);
          if (!options.quiet) {
            info(`      ${repo.url}`);
          }
        }
      }
    }
    
    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to list repos: ${err}`);
    }
    return 1;
  }
}

export interface AddOptions extends GlobalOptions {
  url: string;
  namespace?: string;
}

export async function add(options: AddOptions): Promise<number> {
  try {
    await tyvi.addRepo(options.url, { namespace: options.namespace });
    
    if (options.json) {
      printJson({ success: true, url: options.url });
    } else {
      success(`Added repo to inventory: ${options.url}`);
      if (options.namespace) {
        info(`  Namespace: ${options.namespace}`);
      }
      info("Run 'tyvi clone' to clone this repo to staging");
    }
    
    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to add repo: ${err}`);
    }
    return 1;
  }
}

export interface RemoveOptions extends GlobalOptions {
  name: string;
}

export async function remove(options: RemoveOptions): Promise<number> {
  try {
    await tyvi.removeRepo(options.name);
    
    if (options.json) {
      printJson({ success: true, name: options.name });
    } else {
      success(`Removed repo from inventory: ${options.name}`);
    }
    
    return 0;
  } catch (err) {
    if (options.json) {
      printJson({ success: false, error: String(err) });
    } else {
      error(`Failed to remove repo: ${err}`);
    }
    return 1;
  }
}
