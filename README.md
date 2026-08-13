# tyvi-cli

CLI interface for tyvi devspace orchestration.

## Overview

`tyvi-cli` is a thin command-line interface that delegates to the core `tyvi` library. It provides
human-friendly commands for managing devspaces, people, relationships, memories, atoms, and
context.

This package contains **only CLI logic**: argument parsing, output formatting, and user
interaction. All actual functionality lives in the `tyvi` core library.

## Installation

```bash
deno install -gA -n tyvi jsr:@hiisi/tyvi-cli
```

## Commands

### Devspace Management

```bash
tyvi init [path]             # Initialize a new devspace
tyvi status                  # Show devspace status
tyvi list [-s]               # List repos from inventory
tyvi load <pattern>          # Load repos to lab (also --all, --namespace <ns>)
tyvi unload <pattern>        # Unload repos from lab (also --all, --force)
tyvi clone <pattern>         # Clone repos to staging (also --all, --namespace, --category)
tyvi sync [--fetch]          # Sync devspace with inventory
tyvi repo add <url>          # Add repo to inventory (--namespace, --name, --category)
tyvi repo remove <name>      # Remove repo from inventory (--delete-files)
tyvi migrate [-i path]       # Migrate ad-hoc directory into devspace (interactive)
```

### People & Relationships

```bash
tyvi person list                      # List all people
tyvi person show <id>                 # Show person details
tyvi person compute <id>              # Force recompute, show derivation trace
tyvi relationship list                # List relationships
tyvi relationship show <person>       # Show relationships for person
tyvi relationship log <person> <with> # Add relationship log entry
```

### Memory

```bash
tyvi memory list [--person <id>] [--topic <topic>]    # List memories
tyvi memory recall <person> [topic]                   # Recall memories
tyvi memory record <person>                           # Record a new memory (interactive)
tyvi memory reinforce <id> [reason]                   # Reinforce a memory
tyvi memory prune                                     # Prune weak memories
```

### Context & Atoms

```bash
tyvi context get <uri>        # Get context by URI
tyvi context search <query>   # Search context
tyvi context parse <uri>      # Parse a ctx:// URI
tyvi atoms <type> [id]        # Browse atoms (traits, skills, quirks, phrases, experience, stacks)
```

### Git Guards

```bash
tyvi guards setup              # Install git guards (shell, hooks, direnv)
tyvi guards validate           # Validate guard installation
tyvi guards status             # Show guard status
tyvi check-git-allowed <path>  # Check if git allowed (for hooks)
tyvi hint                      # Show devspace info and quick commands
tyvi root                      # Print devspace root path
```

### Shell

```bash
tyvi completions <shell>       # Generate shell completions (bash, zsh, fish)
```

## Architecture

`tyvi-cli` is a single layer over the core library: it parses arguments, calls the matching
`tyvi` function, and formats the result for the terminal. Types, computation, people, memory,
and devspace operations all live in `tyvi`.

## Design Principles

### Thin Wrapper

This CLI does **nothing** except:

1. Parse command-line arguments
2. Call the appropriate `tyvi` core function
3. Format the result for terminal output
4. Handle errors with user-friendly messages

### No Business Logic

All business logic lives in `tyvi`. If you find yourself writing logic here, it probably belongs in
the core library.

### Consistent Output

- Status indicators: `✓` (success), `!` (warning), `✗` (error)
- Colors: green (success), yellow (warning), red (error)
- JSON output available via `--json` flag on most commands
- Quiet mode via `--quiet` flag

## Development

```bash
# Run tests
deno task test

# Type check
deno task check

# Run locally
deno task run <command>
```

## Related Packages

- [`tyvi`](https://github.com/hiisi-digital/tyvi): core library (types, computation, devspace)
- [`tyvi-mcp`](https://github.com/hiisi-digital/tyvi-mcp): MCP server wrapper for AI agents

## License

MPL-2.0
