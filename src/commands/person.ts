/**
 * Person commands
 */

import { bold, cyan, dim } from "@std/fmt/colors";
import {
  printError,
  printInfo,
  printJson,
  printTable,
} from "../utils/output.ts";

// Import from @hiisi/tyvi (will be available once the package is published)
// For now, we'll define the types we expect
interface Person {
  id: string;
  name: string;
  org?: string;
  traits?: Record<string, unknown>;
  skills?: Record<string, unknown>;
  quirks?: string[];
  phrases?: string[];
}

interface ComputedPerson extends Person {
  computedTraits?: Record<
    string,
    { value: unknown; source: "anchor" | "computed" }
  >;
  computedSkills?: Record<
    string,
    { value: unknown; source: "anchor" | "computed" }
  >;
}

interface ListPeopleOptions {
  json?: boolean;
}

interface ShowPersonOptions {
  json?: boolean;
}

interface ComputePersonOptions {
  trace?: boolean;
}

/**
 * List all people
 */
// deno-lint-ignore require-await
export async function listCommand(options: ListPeopleOptions): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const people = await listPeople();

    // For now, return a helpful message
    printInfo("Waiting for @hiisi/tyvi to export listPeople()");
    printInfo("This command will list all people with their traits and skills");

    // Mock data for demonstration
    const people: Person[] = [
      {
        id: "alice",
        name: "Alice Johnson",
        org: "hiisi",
        traits: { creativity: 8, patience: 6 },
        skills: { typescript: 9, design: 7 },
      },
      {
        id: "bob",
        name: "Bob Smith",
        org: "acme",
        traits: { leadership: 9 },
        skills: { management: 8, strategy: 7 },
      },
    ];

    if (options.json) {
      printJson(people);
    } else {
      const headers = ["ID", "Name", "Organization", "Traits", "Skills"];
      const rows = people.map((p) => [
        cyan(p.id),
        p.name,
        p.org || dim("-"),
        Object.keys(p.traits || {}).length.toString(),
        Object.keys(p.skills || {}).length.toString(),
      ]);
      printTable(headers, rows);
    }

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}

/**
 * Show a specific person with computed values
 */
// deno-lint-ignore require-await
export async function showCommand(
  id: string,
  options: ShowPersonOptions,
): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const person = await computePerson(id);

    printInfo(`Showing person: ${id}`);
    printInfo("Waiting for @hiisi/tyvi to export computePerson()");

    // Mock data
    const person: Person = {
      id,
      name: "Alice Johnson",
      org: "hiisi",
      traits: { creativity: 8, patience: 6, focus: 7 },
      skills: { typescript: 9, design: 7, leadership: 6 },
      quirks: ["Always asks 'why?'", "Prefers vim over IDE"],
      phrases: ["Let me think about that", "What if we tried..."],
    };

    if (options.json) {
      printJson(person);
    } else {
      console.log();
      console.log(bold(person.name) + dim(` (${person.id})`));
      if (person.org) {
        console.log(`Organization: ${person.org}`);
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

      if (person.quirks && person.quirks.length > 0) {
        console.log(bold("Quirks:"));
        for (const quirk of person.quirks) {
          console.log(`  • ${quirk}`);
        }
        console.log();
      }

      if (person.phrases && person.phrases.length > 0) {
        console.log(bold("Phrases:"));
        for (const phrase of person.phrases) {
          console.log(`  "${phrase}"`);
        }
        console.log();
      }
    }

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}

/**
 * Compute a person with derivation trace
 */
// deno-lint-ignore require-await
export async function computeCommand(
  id: string,
  _options: ComputePersonOptions,
): Promise<number> {
  try {
    // TODO: Import and call from @hiisi/tyvi once available
    // const result = await computePerson(id, { trace: true });

    printInfo(`Computing person: ${id}`);
    printInfo(
      "Waiting for @hiisi/tyvi to export computePerson() with trace option",
    );
    printInfo(
      "This will show the derivation trace and highlight anchors vs computed values",
    );

    // Mock data showing trace
    console.log();
    console.log(bold("Derivation Trace:"));
    console.log();
    console.log(dim("Anchor values (directly specified):"));
    console.log(`  creativity: 8 ${dim("(from person.toml)")}`);
    console.log(`  typescript: 9 ${dim("(from person.toml)")}`);
    console.log();
    console.log(dim("Computed values (derived):"));
    console.log(`  patience: 6 ${dim("(computed from creativity)")}`);
    console.log(`  leadership: 6 ${dim("(computed from experience)")}`);
    console.log();

    return 0;
  } catch (error) {
    printError(error);
    return 1;
  }
}
