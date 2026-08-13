/**
 * The CLI version.
 *
 * This mirrors the `version` field in deno.json. It is a constant rather than a read of the
 * manifest because deno.json is not part of the published file set, so importing it would
 * resolve at development time and fail for an installed package.
 *
 * @module
 */

/** Version of the CLI, kept in step with deno.json on release. */
export const VERSION = "0.2.0";
