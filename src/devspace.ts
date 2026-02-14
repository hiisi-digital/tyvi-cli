/**
 * Shared devspace resolution for CLI commands.
 *
 * Provides a consistent way to find and load the active devspace
 * from any command, searching up from cwd or using an explicit path.
 *
 * @module
 */

import { findDevspaceRoot, loadDevspace } from "tyvi";
import type { Devspace } from "tyvi";

/**
 * Resolve and load the active devspace.
 *
 * Searches up from `startDir` (default: cwd) for tyvi.toml,
 * then loads the full devspace model.
 *
 * @param startDir - Directory to start searching from (default: cwd)
 * @returns Loaded devspace model
 * @throws Error if no devspace found
 */
export async function resolveDevspace(
  startDir?: string,
): Promise<Devspace> {
  const dir = startDir ?? Deno.cwd();
  return await loadDevspace(dir);
}

/**
 * Try to resolve a devspace, returning null instead of throwing.
 *
 * @param startDir - Directory to start searching from
 * @returns Devspace or null if not found
 */
export async function tryResolveDevspace(
  startDir?: string,
): Promise<Devspace | null> {
  const dir = startDir ?? Deno.cwd();
  const root = await findDevspaceRoot(dir);
  if (!root) return null;
  return await loadDevspace(root);
}
