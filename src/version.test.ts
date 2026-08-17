/**
 * Tests for the version constant
 */

import { VERSION } from "./version.ts";

Deno.test("VERSION matches the version field in deno.json", async () => {
  const manifest = JSON.parse(
    await Deno.readTextFile(new URL("../deno.json", import.meta.url)),
  ) as { version: string };

  if (VERSION !== manifest.version) {
    throw new Error(
      `version.ts reports ${VERSION}, deno.json declares ${manifest.version}`,
    );
  }
});
