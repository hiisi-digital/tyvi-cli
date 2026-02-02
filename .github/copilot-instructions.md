# Copilot Instructions - tyvi-cli

> **Terminal interface for tyvi devspace operations.**

## What is tyvi-cli?

**Thin wrapper around tyvi core**. Human-friendly terminal commands.

Responsibilities:
- Argument parsing
- Terminal output formatting (colors, tables, progress)
- User interaction (prompts, confirmations)
- Error display with helpful messages

NOT responsible for:
- Business logic (delegate to `tyvi` core)
- Config parsing (delegate to `tyvi` core)
- Git operations (delegate to `tyvi` core)

## Key Files

- `docs/DESIGN.md` — CLI design decisions
- `docs/TODO.md` — Implementation tasks
- `src/commands/` — Individual command implementations
- `src/output.ts` — Terminal formatting utilities

## Development Rules

**Delegate Everything**: All logic calls `tyvi` core functions.

**Format Output Only**: CLI's job is making tyvi's output human-readable.

**User-Friendly Errors**: Always suggest next steps on failures.

**Support Modes**: `--quiet`, `--json`, `--no-color` for all commands.

## Commit Style

Format: `type: lowercase message`

Examples:
- `feat: add status command with table output`
- `fix: handle missing devspace gracefully`
- `refactor: extract table formatting`

## Dependencies

- `@std/cli` — Argument parsing
- `@std/fmt` — Terminal colors
- `@hiisi/tyvi` — Core library (all business logic)

No other dependencies allowed.

## Design Principles

1. **Thin wrapper** — zero business logic
2. **Delegate everything** — call tyvi core for operations
3. **Format output** — make it scannable and helpful
4. **Fail gracefully** — always show recovery steps

## Command Structure

```typescript
// Good — delegates to core
export async function statusCommand(args: StatusArgs) {
  const devspace = await tyvi.loadDevspace(args.path);
  const status = await tyvi.getStatus(devspace, args.filters);
  
  formatStatusTable(status); // CLI formats only
}

// Bad — contains business logic
export async function statusCommand(args: StatusArgs) {
  const config = parseToml(await readFile("tyvi.toml")); // ❌
  // ... parsing logic
}
```

## Output Guidelines

- **Scannable** — align columns, use whitespace
- **Symbols** — ✓ (success), ! (warning), ✗ (error), - (neutral)
- **Colors** — green (success), yellow (warning), red (error)
- **Summary** — always end with summary line

## Core Dependencies Ready

tyvi core now exports: computation, atoms, people, memory, context.

Still pending: devspace operations (load/unload), JSR publication.

Use local import: `"tyvi": "../tyvi/mod.ts"`

## Related Repos

- **tyvi** — Core library (delegate ALL logic here)
- **tyvi-mcp** — AI agent interface
- Example: User's devspace data repo for content/config
