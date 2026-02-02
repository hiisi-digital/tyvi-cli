/**
 * Interactive prompt utilities
 */

/**
 * Prompt for text input
 */
export async function promptText(message: string): Promise<string> {
  console.log(message);
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) return "";
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

/**
 * Prompt for confirmation (y/n)
 */
export async function promptConfirm(
  message: string,
  defaultYes = false,
): Promise<boolean> {
  const suffix = defaultYes ? " [Y/n]" : " [y/N]";
  const response = await promptText(message + suffix);

  if (response.length === 0) return defaultYes;

  const normalized = response.toLowerCase();
  return normalized === "y" || normalized === "yes";
}
