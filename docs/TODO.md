# tyvi-cli TODO

Implementation tasks for the CLI interface.

---

## Legend

- `[ ]` - Not started
- `[~]` - In progress
- `[x]` - Complete
- `[!]` - Blocked / needs attention

---

## Phase 1: Foundation

### Project Setup
- [ ] Initialize deno.json with dependencies
- [ ] Set up TypeScript strict mode
- [ ] Create mod.ts entry point
- [ ] Add LICENSE (MPL-2.0)
- [ ] Set up test infrastructure
- [ ] Configure CI workflow

### CLI Framework
- [ ] Set up argument parsing with @std/cli
- [ ] Implement global flags (--help, --version, --quiet, --json)
- [ ] Implement command routing
- [ ] Consistent exit codes

### Output Utilities
- [ ] Color formatting (green/yellow/red)
- [ ] Status indicators (✓, !, ✗, -, ?)
- [ ] Table formatting with alignment
- [ ] Progress indicators
- [ ] JSON output mode
- [ ] Quiet mode

---

## Phase 2: Devspace Commands

### tyvi init
- [ ] Parse arguments
- [ ] Call tyvi.initDevspace()
- [ ] Format success output
- [ ] Handle errors

### tyvi status
- [ ] Parse filters (--dirty, --loaded, --namespace)
- [ ] Call tyvi.getStatus()
- [ ] Format lab/staging display
- [ ] JSON output support

### tyvi load
- [ ] Parse pattern argument
- [ ] Call tyvi.load()
- [ ] Show progress during clone/move
- [ ] Format success with lab path

### tyvi unload
- [ ] Parse pattern argument
- [ ] Call tyvi.unload()
- [ ] Handle refusal (dirty/ahead) with clear message
- [ ] Format success

### tyvi clone
- [ ] Parse pattern and filters
- [ ] Call tyvi.clone()
- [ ] Show progress
- [ ] Format summary

### tyvi sync
- [ ] Parse options (--fetch)
- [ ] Call tyvi.sync()
- [ ] Format changes made

---

## Phase 3: Repo Commands

### tyvi list
- [ ] Parse filters (--loaded, --missing)
- [ ] Call tyvi.listRepos()
- [ ] Format table output
- [ ] JSON output support

### tyvi add
- [ ] Parse URL argument
- [ ] Parse --namespace option
- [ ] Call tyvi.addRepo()
- [ ] Format success

### tyvi remove
- [ ] Parse name argument
- [ ] Confirm if loaded
- [ ] Call tyvi.removeRepo()
- [ ] Format success

---

## Phase 4: Person Commands

### tyvi person list
- [ ] Call tyvi.listPeople()
- [ ] Format table with key traits
- [ ] JSON output support

### tyvi person show
- [ ] Parse person ID
- [ ] Call tyvi.getPerson()
- [ ] Format computed values
- [ ] Show quirks and phrases

### tyvi person compute
- [ ] Parse person ID
- [ ] Call tyvi.computePerson() with trace
- [ ] Format derivation trace
- [ ] Show anchors vs computed

---

## Phase 5: Memory Commands

### tyvi memory recall
- [ ] Parse person and topic arguments
- [ ] Call tyvi.recallMemories()
- [ ] Format memory list with strength
- [ ] JSON output support

### tyvi memory record
- [ ] Parse person argument
- [ ] Interactive prompt for content
- [ ] Call tyvi.recordMemory()
- [ ] Format success

### tyvi memory list
- [ ] Parse filters (--person, --topic)
- [ ] Call tyvi.listMemories()
- [ ] Format table
- [ ] JSON output support

---

## Phase 6: Context Commands

### tyvi context search
- [ ] Parse query argument
- [ ] Call tyvi.searchContext()
- [ ] Format results with snippets
- [ ] JSON output support

### tyvi context get
- [ ] Parse URI argument
- [ ] Call tyvi.getContext()
- [ ] Format full content
- [ ] JSON output support

---

## Phase 7: Hook Commands

### tyvi check-git-allowed
- [ ] Parse path argument
- [ ] Call tyvi.checkGitAllowed()
- [ ] Exit 0 or 1 (no output needed)

### tyvi hint
- [ ] Call tyvi.getDevspaceHint()
- [ ] Format helpful guidance

### tyvi root
- [ ] Call tyvi.findDevspaceRoot()
- [ ] Print path (for shell scripts)

### tyvi init-hooks
- [ ] Parse --global flag
- [ ] Call tyvi.initHooks()
- [ ] Format success with instructions

---

## Phase 8: Polish

### Error Handling
- [ ] User-friendly error messages
- [ ] Include recovery suggestions
- [ ] Consistent exit codes

### Shell Completions
- [ ] Generate bash completions
- [ ] Generate zsh completions
- [ ] Generate fish completions

### Documentation
- [ ] Complete README with all commands
- [ ] Man page generation
- [ ] --help text for all commands

---

## Blocked

These tasks are blocked until `tyvi` core exports the required functions:

- [!] All devspace commands — need tyvi devspace module
- [!] All person commands — need tyvi people module
- [!] All memory commands — need tyvi memory module
- [!] All context commands — need tyvi context module

---

## Notes

### Design Principles

- **Thin wrapper**: No business logic here
- **Delegate everything**: Call tyvi core for all operations
- **Format output**: Only responsibility is user-friendly display
- **Fail gracefully**: Always show helpful error messages

### Dependencies

- `@std/cli` — Argument parsing
- `@std/fmt` — Terminal colors
- `@hiisi/tyvi` — Core library (everything else)

No other dependencies allowed.

---

## Related Documents

- `docs/DESIGN.md` — Architecture decisions
- `tyvi/docs/DESIGN.md` — Core library design
- `tyvi/docs/TODO.md` — Core library tasks
