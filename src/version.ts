/**
 * The CLI version.
 *
 * This mirrors the `version` field in deno.json. Nothing derives one from the other at runtime,
 * so a release edits both. `version.test.ts` fails when they drift, which is how 0.2.0 shipped
 * to JSR reporting 0.1.0.
 *
 * @module
 */

/** Version of the CLI, kept in step with deno.json on release. */
export const VERSION = "0.2.0";
