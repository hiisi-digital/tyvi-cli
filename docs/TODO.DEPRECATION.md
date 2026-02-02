# tyvi-cli Deprecation TODO

This document tracks items that need to be deprecated, removed, or migrated.

---

## Status: NEW PACKAGE

tyvi-cli is a **new package** created to separate CLI concerns from the core
tyvi library.

This package has **no legacy code** to deprecate.

---

## Migration: Code Moving INTO This Package

The following code should be moved **from tyvi to tyvi-cli**:

### From tyvi/src/cli/

| File                 | Status   | Notes                    |
| -------------------- | -------- | ------------------------ |
| `mod.ts`             | [ ] Move | CLI entry point          |
| `output.ts`          | [ ] Move | Terminal formatting      |
| `commands/init.ts`   | [ ] Move | Update to call tyvi core |
| `commands/status.ts` | [ ] Move | Update to call tyvi core |
| `commands/clone.ts`  | [ ] Move | Update to call tyvi core |
| `commands/sync.ts`   | [ ] Move | Update to call tyvi core |
| `commands/list.ts`   | [ ] Move | Update to call tyvi core |
| `commands/add.ts`    | [ ] Move | Update to call tyvi core |
| `commands/remove.ts` | [ ] Move | Update to call tyvi core |

### Migration Steps

1. [ ] Copy files from tyvi/src/cli/ to tyvi-cli/src/
2. [ ] Update imports to use @hiisi/tyvi
3. [ ] Remove any business logic (move to tyvi core if needed)
4. [ ] Update tyvi to remove src/cli/ directory
5. [ ] Update tyvi to export core functions for CLI to use
6. [ ] Test that CLI works with tyvi as dependency

---

## After Migration: tyvi Cleanup

Once CLI is moved here, the following should be **deleted from tyvi**:

- [ ] `tyvi/src/cli/` — entire directory
- [ ] CLI-related dependencies in tyvi/deno.json (if any)
- [ ] CLI-specific types that aren't needed by core

---

## Terminology Alignment

Ensure no outdated terminology:

- [ ] No "workspace" (use "devspace")
- [ ] No "crew" (use "people")
- [ ] No "agents" referring to people (use "people" or "person")

---

## Completion Criteria

This deprecation TODO is complete when:

1. [ ] All CLI code lives in tyvi-cli, not tyvi
2. [ ] tyvi-cli imports @hiisi/tyvi for all functionality
3. [ ] tyvi exports clean API for CLI to consume
4. [ ] No duplicate code between packages
5. [ ] All terminology is current
