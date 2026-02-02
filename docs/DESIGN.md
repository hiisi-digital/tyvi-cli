# tyvi-cli Design Document

> CLI interface for tyvi devspace orchestration.

This package provides a command-line interface to the `tyvi` core library. It is intentionally thin — all business logic lives in `tyvi`.

---

## Overview

tyvi-cli is **one of several interfaces** to tyvi:

| Interface | Purpose |
|-----------|---------|
| **tyvi-cli** | Human interaction via terminal |
| **tyvi-mcp** | AI agent interaction via MCP protocol |
| **tyvi** (direct) | Programmatic use in other Deno/TS code |

All interfaces use the same core library. This ensures consistent behavior regardless of how tyvi is accessed.

---

## Scope

### In Scope

- Command-line argument parsing
- Terminal output formatting (colors, tables, progress)
- User interaction (prompts, confirmations)
- Error messages with recovery suggestions
- JSON output mode for scripting
- Shell completions

### Out of Scope

**The following are NOT part of tyvi-cli — see `tyvi` core:**

- Types and schemas
- Devspace operations (load, unload, clone)
- Git operations and restrictions
- People computation engine
- Memory system
- Context resolution
- Config parsing
- All business logic

---

## Architecture

```
tyvi-cli/
├── src/
│   ├── commands/           # One file per command group
│   │   ├── devspace.ts     # init, status, load, unload, clone, sync
│   │   ├── repo.ts         # list, add, remove
│   │   ├── person.ts       # list, show, compute
│   │   ├── memory.ts       # recall, record, list
│   │   ├── context.ts      # search, get
│   │   └── hooks.ts        # check-git-allowed, hint, root, init-hooks
│   ├── output.ts           # Terminal formatting utilities
│   ├── prompts.ts          # User interaction (confirm, select)
│   └── mod.ts              # CLI entry point, argument routing
├── docs/
│   ├── DESIGN.md           # This file
│   └── TODO.md             # Implementation tasks
├── mod.ts                  # Main export
├── deno.json
├── README.md
└── LICENSE
```

---

## Command Structure

### Entry Point

```bash
tyvi <command> [subcommand] [options] [args]
```

### Command Groups

| Group | Commands | Description |
|-------|----------|-------------|
| (root) | `init`, `status`, `load`, `unload`, `clone`, `sync` | Devspace management |
| (root) | `list`, `add`, `remove` | Repo management |
| `person` | `list`, `show`, `compute` | People operations |
| `memory` | `recall`, `record`, `list` | Memory operations |
| `context` | `search`, `get` | Context queries |
| (root) | `check-git-allowed`, `hint`, `root`, `init-hooks` | Git/hooks |

### Global Flags

| Flag | Description |
|------|-------------|
| `--help`, `-h` | Show help |
| `--version`, `-V` | Show version |
| `--quiet`, `-q` | Minimal output |
| `--verbose`, `-v` | Verbose output |
| `--json` | JSON output (where applicable) |
| `--no-color` | Disable colors |

---

## Output Formatting

### Status Indicators

```
✓  Success (green)
!  Warning (yellow)
✗  Error (red)
-  Not applicable (gray)
?  Unknown (gray)
```

### Status Display

```
Lab (.lab/):
  viola ............... ✓ clean (main) 3 days ago
  nutshell ............ ! dirty (fix/tests +3 -1) 2 hours ago

Staging:
  @hiisi (12 repos, 2 loaded)
  @orgrinrt (5 repos, 1 loaded)

Summary: 3 loaded, 1 dirty, 17 total
```

### JSON Mode

All commands that display data support `--json`:

```bash
tyvi status --json
```

```json
{
  "lab": [
    {"name": "viola", "status": "clean", "branch": "main"}
  ],
  "staging": {
    "@hiisi": {"total": 12, "loaded": 2},
    "@orgrinrt": {"total": 5, "loaded": 1}
  }
}
```

---

## Error Handling

### User-Friendly Errors

Every error should include:
1. What went wrong
2. Where it went wrong (if applicable)
3. How to fix it

```
Error: Repository 'viola' not found in inventory.
  Searched: @hiisi/inventory.toml, @orgrinrt/inventory.toml
  Did you mean: viola-cli, viola-default-lints?
  To add: tyvi add git@github.com:hiisi-digital/viola.git
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Config error |
| 4 | Git error |
| 5 | Permission denied |

---

## Implementation Pattern

Each command follows the same pattern:

```typescript
// commands/devspace.ts

import { loadDevspace, getStatus } from "@hiisi/tyvi";
import { formatStatus, printError } from "../output.ts";

export async function statusCommand(options: StatusOptions): Promise<number> {
    try {
        // 1. Call tyvi core
        const devspace = await loadDevspace(options.root);
        const status = await getStatus(devspace, options.filters);
        
        // 2. Format output
        if (options.json) {
            console.log(JSON.stringify(status, null, 2));
        } else {
            formatStatus(status, options);
        }
        
        return 0;
    } catch (error) {
        // 3. Handle errors
        printError(error);
        return 1;
    }
}
```

---

## Dependencies

### From Deno std

- `@std/cli` — Argument parsing
- `@std/fmt` — Terminal colors

### From tyvi ecosystem

- `@hiisi/tyvi` — Core library (ALL functionality)

### No Other Dependencies

Keep this package minimal. If you need something, it probably belongs in `tyvi` core.

---

## Testing

### Unit Tests

Test argument parsing and output formatting:

```typescript
Deno.test("status command parses filters", () => {
    const args = parseStatusArgs(["--dirty", "--namespace", "@hiisi"]);
    assertEquals(args.dirty, true);
    assertEquals(args.namespace, "@hiisi");
});
```

### Integration Tests

Test full command execution against fixture devspaces:

```typescript
Deno.test("status command shows loaded repos", async () => {
    const output = await runCommand(["status"], { cwd: "fixtures/devspace" });
    assertStringIncludes(output, "viola");
    assertStringIncludes(output, "✓ clean");
});
```

---

## Open Questions

None currently — this package is intentionally simple.

---

## Related Documents

- `tyvi/docs/DESIGN.md` — Core library design
- `tyvi-mcp/docs/DESIGN.md` — MCP server design
- `docs/TODO.md` — Implementation tasks
