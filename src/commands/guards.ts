/**
 * Git guards commands (setup, validate, status)
 * @module
 */

import {
  appendToRcFile,
  detectShell,
  hasDirenv,
  hasHooks,
  installHooks,
  validateGuards,
  writeEnvrc,
  writeShellInit,
} from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { confirm } from "../prompts.ts";
import { bold, gray, green, output, red, STATUS, yellow } from "../output.ts";

/**
 * Handle guards subcommands
 */
export async function guardsCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "setup":
      return await guardsSetup(subargs, flags);
    case "validate":
      return await guardsValidate(subargs, flags);
    case "status":
      return await guardsStatus(subargs, flags);
    default:
      console.log(`${bold("tyvi guards")} - Git guard management

${bold("Usage:")} tyvi guards <command>

${bold("Commands:")}
  setup       Install git guards (shell, hooks, direnv)
  validate    Validate guard installation
  status      Show guard status`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * Set up git guards interactively
 */
async function guardsSetup(
  _args: string[],
  _flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();

    console.log(bold("Setting up git guards..."));
    console.log();

    // 1. Shell integration
    const shellInfo = await detectShell();
    console.log(`Detected shell: ${bold(shellInfo.shell)}`);
    if (shellInfo.rcFile) {
      console.log(`RC file: ${shellInfo.rcFile}`);
    }

    const initPath = await writeShellInit(devspace);
    console.log(green(`${STATUS.success} Shell init script: ${initPath}`));

    // Offer to add to RC file
    if (shellInfo.rcFile) {
      const addToRc = await confirm(
        `Add source line to ${shellInfo.rcFile}?`,
      );
      if (addToRc) {
        await appendToRcFile(shellInfo.rcFile, initPath);
        console.log(green(`${STATUS.success} Added to ${shellInfo.rcFile}`));
      }
    }

    console.log();

    // 2. Git hooks
    const installHooksOpt = await confirm("Install git pre-commit hook?");
    if (installHooksOpt) {
      try {
        await installHooks(devspace);
        console.log(green(`${STATUS.success} Git hooks installed`));
      } catch (error) {
        console.log(
          yellow(
            `${STATUS.warning} Could not install hooks: ${
              error instanceof Error ? error.message : error
            }`,
          ),
        );
      }
    }

    console.log();

    // 3. direnv
    const direnvAvailable = await hasDirenv();
    if (direnvAvailable) {
      console.log("direnv detected.");
      const setupDirenv = await confirm("Create .envrc files?");
      if (setupDirenv) {
        const rootEnvrc = await writeEnvrc(devspace, "root");
        console.log(green(`${STATUS.success} Created ${rootEnvrc}`));

        const labEnvrc = await writeEnvrc(devspace, "lab");
        console.log(green(`${STATUS.success} Created ${labEnvrc}`));

        const parentDirenv = await confirm(
          "Guard parent directory too?",
        );
        if (parentDirenv) {
          const parentEnvrc = await writeEnvrc(devspace, "parent");
          console.log(green(`${STATUS.success} Created ${parentEnvrc}`));
        }
      }
    } else {
      console.log(gray("direnv not detected (optional)"));
    }

    console.log();
    console.log(green(`${STATUS.success} Git guards set up`));
    console.log(gray("Run 'tyvi guards validate' to verify"));

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to set up guards: ${
          error instanceof Error ? error.message : error
        }`,
      ),
    );
    return EXIT.ERROR;
  }
}

/**
 * Validate guard installation
 */
async function guardsValidate(
  _args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const result = await validateGuards(devspace);

    if (flags.json) {
      output(result, { json: true });
      return result.valid ? EXIT.SUCCESS : EXIT.ERROR;
    }

    if (result.valid && result.issues.length === 0) {
      console.log(green(`${STATUS.success} All guards in place`));
      return EXIT.SUCCESS;
    }

    if (result.valid) {
      console.log(
        yellow(`${STATUS.warning} Guards valid with warnings:`),
      );
    } else {
      console.log(red(`${STATUS.error} Guard issues found:`));
    }

    console.log();

    for (const issue of result.issues) {
      const icon = issue.severity === "error" ? red(STATUS.error) : yellow(STATUS.warning);
      console.log(`  ${icon} [${issue.type}] ${issue.message}`);
      if (issue.fix) {
        console.log(gray(`    Fix: ${issue.fix}`));
      }
    }

    return result.valid ? EXIT.SUCCESS : EXIT.ERROR;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to validate: ${error instanceof Error ? error.message : error}`,
      ),
    );
    return EXIT.ERROR;
  }
}

/**
 * Show guard status summary
 */
async function guardsStatus(
  _args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();

    const shellInfo = await detectShell();
    const direnvAvailable = await hasDirenv();
    const hooksInstalled = await hasHooks(devspace);
    const policy = devspace.config.devspace.git_policy;

    if (flags.json) {
      output({
        shell: shellInfo,
        direnv: direnvAvailable,
        hooks: hooksInstalled,
        policy: policy ?? null,
      }, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold("Git Guard Status:"));
    console.log();
    console.log(
      `  Config:  ${policy?.enabled ? green("enabled") : yellow("disabled")}`,
    );
    console.log(
      `  Shell:   ${shellInfo.shell} (${shellInfo.rcFile ?? "no RC file"})`,
    );
    console.log(
      `  Hooks:   ${hooksInstalled ? green("installed") : gray("not installed")}`,
    );
    console.log(
      `  direnv:  ${direnvAvailable ? green("available") : gray("not available")}`,
    );

    if (policy?.allowed_paths.length) {
      console.log();
      console.log(`  Whitelist: ${policy.allowed_paths.join(", ")}`);
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to get status: ${error instanceof Error ? error.message : error}`,
      ),
    );
    return EXIT.ERROR;
  }
}
