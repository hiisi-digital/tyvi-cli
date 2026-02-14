/**
 * Shell completion generation
 * @module
 */

import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { bold } from "../output.ts";

/**
 * Generate shell completions
 */
export function completionsCommand(
  args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  const shell = args[0];

  switch (shell) {
    case "bash":
      console.log(generateBashCompletions());
      return Promise.resolve(EXIT.SUCCESS);
    case "zsh":
      console.log(generateZshCompletions());
      return Promise.resolve(EXIT.SUCCESS);
    case "fish":
      console.log(generateFishCompletions());
      return Promise.resolve(EXIT.SUCCESS);
    default:
      console.log(`${bold("tyvi completions")} - Generate shell completions

${bold("Usage:")} tyvi completions <shell>

${bold("Shells:")}
  bash    Bash completions (add to ~/.bashrc)
  zsh     Zsh completions (add to ~/.zshrc)
  fish    Fish completions (add to ~/.config/fish/completions/)

${bold("Example:")}
  tyvi completions bash >> ~/.bashrc
  tyvi completions zsh >> ~/.zshrc
  tyvi completions fish > ~/.config/fish/completions/tyvi.fish`);
      return Promise.resolve(shell ? EXIT.INVALID_ARGS : EXIT.SUCCESS);
  }
}

const COMMANDS = [
  "help",
  "version",
  "init",
  "status",
  "list",
  "load",
  "unload",
  "clone",
  "sync",
  "repo",
  "migrate",
  "check-git-allowed",
  "hint",
  "root",
  "person",
  "memory",
  "context",
  "atoms",
  "relationship",
  "guards",
  "completions",
];

const SUBCOMMANDS: Record<string, string[]> = {
  repo: ["add", "remove", "rm"],
  person: ["list", "show"],
  memory: ["list", "recall", "record", "reinforce", "prune"],
  context: ["search", "get", "parse"],
  atoms: ["traits", "skills", "quirks", "phrases", "experience", "stacks"],
  relationship: ["list", "show", "log"],
  guards: ["setup", "validate", "status"],
};

function generateBashCompletions(): string {
  const subcommandCases = Object.entries(SUBCOMMANDS)
    .map(([cmd, subs]) =>
      `        ${cmd}) COMPREPLY=( $(compgen -W "${subs.join(" ")}" -- "$cur") ) ;;`
    )
    .join("\n");

  return `# tyvi bash completions
# Add to ~/.bashrc or source directly

_tyvi_completions() {
    local cur prev commands
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    commands="${COMMANDS.join(" ")}"

    if [ "$COMP_CWORD" -eq 1 ]; then
        COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
        return 0
    fi

    case "$prev" in
${subcommandCases}
        load|unload|clone) COMPREPLY=( $(compgen -W "--all --namespace --force" -- "$cur") ) ;;
        sync) COMPREPLY=( $(compgen -W "--fetch --prune --dry-run" -- "$cur") ) ;;
        list) COMPREPLY=( $(compgen -W "--short -s" -- "$cur") ) ;;
        migrate) COMPREPLY=( $(compgen -W "--input --move" -- "$cur") ) ;;
        completions) COMPREPLY=( $(compgen -W "bash zsh fish" -- "$cur") ) ;;
    esac
    return 0
}

complete -F _tyvi_completions tyvi
`;
}

function generateZshCompletions(): string {
  const subcommandCases = Object.entries(SUBCOMMANDS)
    .map(([cmd, subs]) =>
      `        ${cmd}) _values 'subcommand' ${subs.map((s) => `'${s}'`).join(" ")} ;;`
    )
    .join("\n");

  return `#compdef tyvi
# tyvi zsh completions
# Add to ~/.zshrc or place in fpath

_tyvi() {
    local -a commands
    commands=(
${COMMANDS.map((c) => `        '${c}:${c} command'`).join("\n")}
    )

    _arguments -C \\
        '1:command:->command' \\
        '*::arg:->args'

    case $state in
    command)
        _describe 'command' commands
        ;;
    args)
        case $words[1] in
${subcommandCases}
            load|unload|clone) _arguments '--all' '--namespace' '--force' '--category' ;;
            sync) _arguments '--fetch' '--prune' '--dry-run' ;;
            list) _arguments '--short' '-s' ;;
            migrate) _arguments '--input' '--move' ;;
            completions) _values 'shell' 'bash' 'zsh' 'fish' ;;
        esac
        ;;
    esac
}

_tyvi "$@"
`;
}

function generateFishCompletions(): string {
  const commandCompletions = COMMANDS
    .map((c) => `complete -c tyvi -n '__fish_use_subcommand' -a '${c}' -d '${c}'`)
    .join("\n");

  const subcommandCompletions = Object.entries(SUBCOMMANDS)
    .flatMap(([cmd, subs]) =>
      subs.map((sub) =>
        `complete -c tyvi -n '__fish_seen_subcommand_from ${cmd}' -a '${sub}' -d '${sub}'`
      )
    )
    .join("\n");

  return `# tyvi fish completions
# Save to ~/.config/fish/completions/tyvi.fish

# Disable file completions
complete -c tyvi -f

# Commands
${commandCompletions}

# Subcommands
${subcommandCompletions}

# Flags
complete -c tyvi -s h -l help -d 'Show help'
complete -c tyvi -s V -l version -d 'Show version'
complete -c tyvi -s q -l quiet -d 'Minimal output'
complete -c tyvi -s v -l verbose -d 'Verbose output'
complete -c tyvi -l json -d 'JSON output'
complete -c tyvi -l no-color -d 'Disable colors'

# Command-specific flags
complete -c tyvi -n '__fish_seen_subcommand_from load unload clone' -l all -d 'All repos'
complete -c tyvi -n '__fish_seen_subcommand_from load clone' -l namespace -d 'Filter by namespace'
complete -c tyvi -n '__fish_seen_subcommand_from unload' -s f -l force -d 'Force unload'
complete -c tyvi -n '__fish_seen_subcommand_from sync' -l fetch -d 'Fetch remotes'
complete -c tyvi -n '__fish_seen_subcommand_from sync' -l prune -d 'Prune branches'
complete -c tyvi -n '__fish_seen_subcommand_from list' -s s -l short -d 'Short format'
complete -c tyvi -n '__fish_seen_subcommand_from completions' -a 'bash zsh fish' -d 'Shell type'
`;
}
