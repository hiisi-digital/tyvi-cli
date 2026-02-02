/**
 * Stub/mock implementations for @hiisi/tyvi core library
 * 
 * These are temporary placeholders until the real tyvi library is available.
 * The CLI can be developed and tested against these stubs.
 */

// Types
export interface DevspaceConfig {
  root: string;
  lab: string;
  staging: string;
}

export interface Repo {
  name: string;
  url: string;
  namespace?: string;
  loaded?: boolean;
  status?: "clean" | "dirty";
  branch?: string;
}

export interface DevspaceStatus {
  lab: Repo[];
  staging: { [namespace: string]: { total: number; loaded: number } };
  summary: { loaded: number; dirty: number; total: number };
}

// Stub implementations
export async function initDevspace(options?: { root?: string }): Promise<void> {
  console.log(`[STUB] initDevspace called with root: ${options?.root || "."}`);
  // In real implementation, this would create .tyvi directory structure
}

export async function getDevspaceStatus(options?: { root?: string }): Promise<DevspaceStatus> {
  console.log(`[STUB] getDevspaceStatus called`);
  // Return mock data
  return {
    lab: [
      { name: "example-repo", url: "https://github.com/example/repo.git", status: "clean", branch: "main", loaded: true },
    ],
    staging: {
      "@hiisi": { total: 5, loaded: 1 },
    },
    summary: { loaded: 1, dirty: 0, total: 6 },
  };
}

export async function loadRepos(pattern: string, options?: { root?: string }): Promise<string[]> {
  console.log(`[STUB] loadRepos called with pattern: ${pattern}`);
  // In real implementation, this would move repos from staging to lab
  return ["example-repo"];
}

export async function unloadRepos(pattern: string, options?: { root?: string }): Promise<string[]> {
  console.log(`[STUB] unloadRepos called with pattern: ${pattern}`);
  // In real implementation, this would move repos from lab to staging
  return ["example-repo"];
}

export async function cloneRepos(pattern: string, options?: { root?: string }): Promise<string[]> {
  console.log(`[STUB] cloneRepos called with pattern: ${pattern}`);
  // In real implementation, this would clone repos to staging
  return ["example-repo"];
}

export async function syncDevspace(options?: { root?: string; fetch?: boolean }): Promise<{ added: string[]; removed: string[] }> {
  console.log(`[STUB] syncDevspace called`);
  // In real implementation, this would sync inventory with devspace
  return { added: [], removed: [] };
}

export async function listRepos(options?: { root?: string; loaded?: boolean }): Promise<Repo[]> {
  console.log(`[STUB] listRepos called`);
  // Return mock data
  return [
    { name: "example-repo", url: "https://github.com/example/repo.git", namespace: "@hiisi", loaded: true },
    { name: "another-repo", url: "https://github.com/example/another.git", namespace: "@hiisi", loaded: false },
  ];
}

export async function addRepo(url: string, options?: { namespace?: string }): Promise<void> {
  console.log(`[STUB] addRepo called with url: ${url}, namespace: ${options?.namespace}`);
  // In real implementation, this would add repo to inventory
}

export async function removeRepo(name: string): Promise<void> {
  console.log(`[STUB] removeRepo called with name: ${name}`);
  // In real implementation, this would remove repo from inventory
}
