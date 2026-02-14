/**
 * Person commands
 * @module
 */

import { computePerson, listPeople, loadPerson } from "tyvi";
import type { GlobalFlags } from "../mod.ts";
import { EXIT } from "../mod.ts";
import { resolveDevspace } from "../devspace.ts";
import { bold, formatTable, gray, green, output, red, STATUS } from "../output.ts";

/**
 * Handle person subcommands
 */
export async function personCommand(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const subcommand = args[0];
  const subargs = args.slice(1);

  switch (subcommand) {
    case "list":
      return await personList(flags);
    case "show":
      return await personShow(subargs, flags);
    case "compute":
      return await personCompute(subargs, flags);
    default:
      console.log(`${bold("tyvi person")} - People management

${bold("Usage:")} tyvi person <command> [args]

${bold("Commands:")}
  list              List all people
  show <id>         Show person details
  compute <id>      Show computed person with trace`);
      return subcommand ? EXIT.INVALID_ARGS : EXIT.SUCCESS;
  }
}

/**
 * List all people
 */
async function personList(flags: GlobalFlags): Promise<number> {
  try {
    const devspace = await resolveDevspace();
    const people = await listPeople(devspace.rootPath);

    if (people.length === 0) {
      if (!flags.quiet) {
        console.log(gray("No people found"));
      }
      return EXIT.SUCCESS;
    }

    if (flags.json) {
      output(people, { json: true });
      return EXIT.SUCCESS;
    }

    const table = formatTable(
      people.map((p) => ({
        id: p.id,
        name: p.name,
        org: p.org || "-",
      })),
      [
        { header: "ID", key: "id" },
        { header: "Name", key: "name" },
        { header: "Org", key: "org" },
      ],
    );
    console.log(table);
    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to list people: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Show person details
 */
async function personShow(args: string[], flags: GlobalFlags): Promise<number> {
  const personId = args[0];
  if (!personId) {
    console.error(red(`${STATUS.error} Missing person ID`));
    console.error("Usage: tyvi person show <id>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const devspace = await resolveDevspace();
    const person = await loadPerson(devspace.rootPath, personId);

    if (flags.json) {
      output(person, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(person.identity.name));
    if (person.identity.pronouns) {
      console.log(gray(person.identity.pronouns));
    }
    console.log();

    if (person.traits && Object.keys(person.traits).length > 0) {
      console.log(bold("Traits:"));
      for (const [key, value] of Object.entries(person.traits)) {
        console.log(`  ${key}: ${value}`);
      }
      console.log();
    }

    if (person.skills && Object.keys(person.skills).length > 0) {
      console.log(bold("Skills:"));
      for (const [key, value] of Object.entries(person.skills)) {
        console.log(`  ${key}: ${value}`);
      }
      console.log();
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to load person: ${error}`));
    return EXIT.ERROR;
  }
}

/**
 * Show computed person with trace
 */
async function personCompute(
  args: string[],
  flags: GlobalFlags,
): Promise<number> {
  const personId = args[0];
  if (!personId) {
    console.error(red(`${STATUS.error} Missing person ID`));
    console.error("Usage: tyvi person compute <id>");
    return EXIT.INVALID_ARGS;
  }

  try {
    const devspace = await resolveDevspace();
    const computed = await computePerson(devspace.rootPath, personId);

    if (flags.json) {
      output(computed, { json: true });
      return EXIT.SUCCESS;
    }

    console.log(bold(computed.identity.name));
    if (computed.identity.pronouns) {
      console.log(gray(computed.identity.pronouns));
    }
    console.log();

    console.log(bold("Computed Traits:"));
    for (const [key, value] of Object.entries(computed.traits)) {
      const traceEntry = computed.trace?.values.get(`traits.${key}`);
      const source = traceEntry?.isAnchor ? green("(anchor)") : gray("(computed)");
      console.log(`  ${key}: ${value} ${source}`);
    }
    console.log();

    console.log(bold("Computed Skills:"));
    for (const [key, value] of Object.entries(computed.skills)) {
      const traceEntry = computed.trace?.values.get(`skills.${key}`);
      const source = traceEntry?.isAnchor ? green("(anchor)") : gray("(computed)");
      console.log(`  ${key}: ${value} ${source}`);
    }

    return EXIT.SUCCESS;
  } catch (error) {
    console.error(red(`${STATUS.error} Failed to compute person: ${error}`));
    return EXIT.ERROR;
  }
}
