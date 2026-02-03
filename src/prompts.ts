/**
 * User prompt utilities
 *
 * This module provides interactive prompts for user input,
 * confirmation, and selection.
 *
 * @module
 */

/**
 * Prompt user for confirmation (yes/no)
 */
export async function confirm(message: string): Promise<boolean> {
  const answer = await input(`${message} (y/n)`);
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

/**
 * Prompt user to select from a list of options
 */
export async function select<T>(message: string, options: T[]): Promise<T> {
  console.log(message);
  options.forEach((option, i) => {
    console.log(`  ${i + 1}. ${String(option)}`);
  });

  const answer = await input("Enter number");
  const index = parseInt(answer, 10) - 1;

  const selected = options[index];
  if (index >= 0 && index < options.length && selected !== undefined) {
    return selected;
  }

  throw new Error(
    `Invalid selection. Please enter a number between 1 and ${options.length}`,
  );
}

/**
 * Prompt user for text input
 */
export async function input(
  message: string,
  defaultValue?: string,
): Promise<string> {
  const prompt = defaultValue
    ? `${message} [${defaultValue}]: `
    : `${message}: `;

  // Write prompt to stderr so it doesn't interfere with piped output
  await Deno.stderr.write(new TextEncoder().encode(prompt));

  // Read from stdin
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);

  if (n === null) {
    // EOF
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error("No input received (EOF)");
  }

  const text = new TextDecoder().decode(buf.subarray(0, n)).trim();

  if (text === "" && defaultValue !== undefined) {
    return defaultValue;
  }

  return text;
}
