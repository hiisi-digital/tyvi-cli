/**
 * Atoms browsing commands
 * @module
 */

import {
  loadExperience,
  loadPhrases,
  loadQuirks,
  loadSkills,
  loadStacks,
  loadTraits,
} from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { bold, formatTable, gray, output, red, STATUS } from "../output.ts";

/**
 * Handle atoms subcommands
 */
export async function atomsCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "traits":
      return await atomsList("traits", loadTraits, subargs, flags);
    case "skills":
      return await atomsList("skills", loadSkills, subargs, flags);
    case "quirks":
      return await atomsList("quirks", loadQuirks, subargs, flags);
    case "phrases":
      return await atomsList("phrases", loadPhrases, subargs, flags);
    case "experience":
      return await atomsList("experience", loadExperience, subargs, flags);
    case "stacks":
      return await atomsList("stacks", loadStacks, subargs, flags);
    default:
      console.log(`${bold("tyvi atoms")} - Browse atom definitions

${bold("Usage:")} tyvi atoms <type> [id]

${bold("Types:")}
  traits       Personality traits (axis-based)
  skills       Technical and soft skills
  quirks       Behavioral quirks
  phrases      Signature phrases
  experience   Experience definitions
  stacks       Technology stacks`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * Generic atom listing
 */
async function atomsList(
  typeName: string,
  // deno-lint-ignore no-explicit-any
  loader: (dataPath: string) => Promise<Map<string, any>>,
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const atoms = await loader(devspace.rootPath);

    if (atoms.size === 0) {
      if (!flags.quiet) {
        console.log(gray(`No ${typeName} found`));
      }
      return EXIT.SUCCESS;
    }

    // Show single atom if ID provided
    const id = args[0];
    if (id) {
      const atom = atoms.get(id);
      if (!atom) {
        console.error(
          red(`${STATUS.error} ${typeName} '${id}' not found`),
        );
        return EXIT.INVALID_ARGS;
      }

      if (flags.json) {
        output({ id, ...atom }, { json: true });
        return EXIT.SUCCESS;
      }

      console.log(bold(id));
      for (const [key, value] of Object.entries(atom)) {
        if (typeof value === "object" && value !== null) {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      return EXIT.SUCCESS;
    }

    // List all atoms
    if (flags.json) {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of atoms) {
        obj[k] = v;
      }
      output(obj, { json: true });
      return EXIT.SUCCESS;
    }

    const rows = [];
    for (const [atomId, atom] of atoms) {
      const desc = atom.description ?? atom.summary ?? atom.name ?? "-";
      rows.push({
        id: atomId,
        description: typeof desc === "string"
          ? desc.slice(0, 50) + (desc.length > 50 ? "..." : "")
          : "-",
      });
    }

    const table = formatTable(rows, [
      { header: "ID", key: "id" },
      { header: "Description", key: "description" },
    ]);
    console.log(bold(`${typeName} (${atoms.size}):`));
    console.log(table);

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(
      red(
        `${STATUS.error} Failed to load ${typeName}: ${
          error instanceof Error ? error.message : error
        }`,
      ),
    );
    return EXIT.ERROR;
  }
}
