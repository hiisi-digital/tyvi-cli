# TODO: CLI Foundation

Branch: `feat/cli-foundation`

This branch implements Phase 1 of tyvi-cli: the CLI framework and output utilities.

---

## Scope

Build the CLI infrastructure that all commands will use:
- Argument parsing and command routing
- Output formatting utilities
- Global flags support
- Error handling patterns

**Note:** tyvi core is not yet published to JSR. Use local import `"tyvi": "../tyvi/mod.ts"`. The devspace operations (load/unload) are still being implemented in tyvi core, so stub those for now.

---

## Part A: Project Structure

- [ ] Create `src/` directory structure:
  ```
  src/
  ├── commands/      # Command implementations (empty for now)
  ├── output.ts      # Terminal formatting utilities
  ├── prompts.ts     # User interaction utilities
  └── mod.ts         # CLI entry point, argument routing
  ```

- [ ] Update `mod.ts` to import and run CLI

---

## Part B: Output Utilities (`src/output.ts`)

Implement terminal formatting helpers:

### Status Indicators
```typescript
export const STATUS = {
  success: "✓",   // green
  warning: "!",   // yellow
  error: "✗",     // red
  neutral: "-",   // gray
  unknown: "?",   // gray
};
```

### Color Functions
```typescript
export function green(text: string): string;
export function yellow(text: string): string;
export function red(text: string): string;
export function gray(text: string): string;
export function bold(text: string): string;
```

### Table Formatting
```typescript
export interface TableColumn {
  header: string;
  key: string;
  align?: "left" | "right";
  width?: number;
}

export function formatTable(rows: Record<string, unknown>[], columns: TableColumn[]): string;
```

### Output Modes
```typescript
export interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
  noColor?: boolean;
}

export function output(data: unknown, options: OutputOptions): void;
export function outputError(error: Error, options: OutputOptions): void;
```

---

## Part C: CLI Entry Point (`src/mod.ts`)

### Global Flags
```typescript
interface GlobalFlags {
  help: boolean;      // -h, --help
  version: boolean;   // -V, --version
  quiet: boolean;     // -q, --quiet
  verbose: boolean;   // -v, --verbose
  json: boolean;      // --json
  noColor: boolean;   // --no-color
}
```

### Command Routing
```typescript
// Parse args and route to appropriate command
export async function main(args: string[]): Promise<number>;

// Command registry
const commands: Record<string, CommandHandler> = {
  // Phase 1: just help and version
  "help": helpCommand,
  "version": versionCommand,
  
  // Stubs for future phases
  "status": statusCommand,      // Phase 2
  "load": loadCommand,          // Phase 2
  "unload": unloadCommand,      // Phase 2
  // ... etc
};
```

### Exit Codes
```typescript
export const EXIT = {
  SUCCESS: 0,
  ERROR: 1,
  INVALID_ARGS: 2,
  CONFIG_ERROR: 3,
  GIT_ERROR: 4,
  PERMISSION_DENIED: 5,
};
```

---

## Part D: User Prompts (`src/prompts.ts`)

```typescript
export async function confirm(message: string): Promise<boolean>;
export async function select<T>(message: string, options: T[]): Promise<T>;
export async function input(message: string, defaultValue?: string): Promise<string>;
```

---

## Part E: Help and Version Commands

### `tyvi --help`
```
tyvi - Devspace orchestration CLI

Usage: tyvi <command> [options]

Commands:
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

Options:
  -h, --help      Show help
  -V, --version   Show version
  -q, --quiet     Minimal output
  -v, --verbose   Verbose output
  --json          JSON output
  --no-color      Disable colors
```

### `tyvi --version`
```
tyvi-cli 0.1.0
```

---

## Part F: Tests

- [ ] Test output formatting
- [ ] Test color functions (with NO_COLOR support)
- [ ] Test table formatting
- [ ] Test argument parsing
- [ ] Test help output
- [ ] Test version output

---

## tyvi Core API Reference

Available functions from tyvi (use local import):

### Currently Available
```typescript
// Config
loadInventory(path: string): Promise<InventoryConfig>

// Workspace (being renamed to devspace)
getStatus(devspace): Promise<Status>
clone(devspace, pattern): Promise<CloneResult>
sync(devspace, options): Promise<SyncResult>
addRepo(devspace, url): Promise<void>
removeRepo(devspace, name): Promise<void>

// Git
isGitRepo(path: string): Promise<boolean>
getGitStatus(path: string): Promise<GitStatus>
getCurrentBranch(path: string): Promise<string>

// People
loadPerson(dataPath: string, id: string): Promise<Person>
computePerson(dataPath: string, id: string): Promise<ComputedPerson>
listPeople(dataPath: string): Promise<PersonSummary[]>

// Memory
recordMemory(dataPath: string, input: MemoryInput): Promise<Memory>
recallMemories(dataPath: string, query: MemoryQuery): Promise<Memory[]>
listMemories(dataPath: string, filters?: MemoryFilters): Promise<MemorySummary[]>
reinforceMemory(dataPath: string, id: string, reason: string): Promise<ReinforcementResult>
pruneMemories(dataPath: string): Promise<PruneResult>

// Context
parseUri(uri: string): ParsedUri
resolveContext(dataPath: string, uri: string, scope?: Scope): Promise<ContextContent>
searchContext(dataPath: string, query: ContextSearchQuery): Promise<ContextSearchResults>
```

### Not Yet Available (stub these)
```typescript
// Devspace operations (in progress in tyvi core)
loadDevspace(root: string): Promise<Devspace>
load(devspace: Devspace, pattern: string): Promise<LoadResult>
unload(devspace: Devspace, pattern: string): Promise<UnloadResult>
checkGitAllowed(devspace: Devspace, path: string): boolean
getDevspaceHint(devspace: Devspace): string
findDevspaceRoot(from: string): string | null
```

---

## Verification Checklist

Before marking complete:

- [ ] `deno check mod.ts` passes
- [ ] `deno test` passes
- [ ] `deno run mod.ts --help` shows help
- [ ] `deno run mod.ts --version` shows version
- [ ] Colors work (and respect NO_COLOR)
- [ ] JSON output mode works
- [ ] Quiet mode works

---

## Notes

- Use `@std/cli` for argument parsing
- Use `@std/fmt/colors` for terminal colors
- Respect `NO_COLOR` environment variable
- All output formatting is in this package; all logic is in tyvi core
