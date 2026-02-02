# tyvi-cli

CLI interface for tyvi devspace orchestration.

## Overview

`tyvi-cli` is a thin command-line interface that delegates to the core `tyvi`
library. It provides human-friendly commands for managing devspaces, people,
memories, and context.

This package contains **only CLI logic** — argument parsing, output formatting,
and user interaction. All actual functionality lives in the `tyvi` core library.

## Installation

```bash
deno install -A jsr:@hiisi/tyvi-cli
```

## Commands

### Devspace Management

```bash
tyvi init                    # Initialize a new devspace
tyvi status                  # Show devspace status
tyvi load <pattern>          # Load repos from staging to lab
tyvi unload <pattern>        # Unload repos from lab to staging
tyvi clone <pattern>         # Clone repos to staging
tyvi sync                    # Sync devspace with inventory
tyvi list                    # List repos from inventory
tyvi add <url>               # Add repo to inventory
tyvi remove <name>           # Remove repo from inventory
```

### People

```bash
tyvi person list             # List all people
tyvi person show <id>        # Show person with computed values
tyvi person compute <id>     # Force recompute, show derivation trace
```

### Memory

```bash
tyvi memory recall <person> [topic]   # Recall memories
tyvi memory record <person>           # Record a new memory
tyvi memory list [--person <id>]      # List memories
```

### Context

```bash
tyvi context search <query>   # Search context
tyvi context get <uri>        # Get context by URI
```

### Git Restrictions

```bash
tyvi check-git-allowed <path>  # Check if git allowed (for hooks)
tyvi hint                      # Show helpful guidance
tyvi root                      # Print devspace root path
tyvi init-hooks                # Set up git hooks
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         tyvi-cli                                │
│                                                                 │
│   Argument parsing, output formatting, user interaction         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ imports
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           tyvi                                  │
│                                                                 │
│   Core library: types, computation, people, memory, devspace    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Design Principles

### Thin Wrapper

This CLI does **nothing** except:

1. Parse command-line arguments
2. Call the appropriate `tyvi` core function
3. Format the result for terminal output
4. Handle errors with user-friendly messages

### No Business Logic

All business logic lives in `tyvi`. If you find yourself writing logic here, it
probably belongs in the core library.

### Consistent Output

- Status indicators: `✓` (success), `!` (warning), `✗` (error)
- Colors: green (success), yellow (warning), red (error)
- JSON output available via `--json` flag on most commands
- Quiet mode via `--quiet` flag

## Development

```bash
# Run tests
deno test

# Type check
deno check mod.ts

# Run locally
deno run --allow-all mod.ts <command>
```

## Related Packages

- [`tyvi`](https://github.com/hiisi-digital/tyvi) — Core library (types,
  computation, devspace)
- [`tyvi-mcp`](https://github.com/hiisi-digital/tyvi-mcp) — MCP server wrapper
  for AI agents

## License

MPL-2.0
