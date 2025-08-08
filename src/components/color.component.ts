/**
 * Import will remove at compile time
 */

import type { AnsiFormatterType } from '@remotex-labs/xansi';

/**
 * Imports
 */

import { xterm } from '@remotex-labs/xansi';

/**
 * Determines if color output should be enabled in the current environment.
 *
 * @returns A boolean indicating whether color output is enabled (true) or disabled (false)
 *
 * @remarks
 * This function checks the global NO_COLOR environment variable to determine if
 * ANSI color codes should be used in terminal output. It returns false when NO_COLOR
 * is set to true, indicating colors should be disabled.
 *
 * This implementation follows the NO_COLOR standard (https://no-color.org/) which
 * provides a simple way for users to disable colored output across applications.
 *
 * @example
 * ```ts
 * if (isColorEnabled()) {
 *   console.log('\x1b[31mThis text is red\x1b[0m');
 * } else {
 *   console.log('This text is not colored');
 * }
 * ```
 *
 * @see NO_COLOR - The environment variable that controls color output
 *
 * @since 1.0.0
 */

export function isColorEnabled(): boolean {
    return !globalThis.NO_COLOR;
}

/**
 * Creates a color-aware wrapper around an ANSI styling function.
 *
 * @param styleFn - The ANSI formatting function to wrap
 * @returns A new function that conditionally applies styling based on color settings
 *
 * @remarks
 * This function creates a wrapper around ANSI styling functions that respects the
 * system's color preferences. When colors are enabled, the original styling function
 * is used. When colors are disabled (via NO_COLOR), the function returns plain text
 * without any ANSI color codes.
 *
 * This approach provides a convenient way to create styling functions that automatically
 * respect user preferences without requiring color checks at each usage site.
 *
 * @example
 * ```ts
 * // Create a color-aware red text formatter
 * const redText = wrap((text) => `\x1b[31m${text}\x1b[0m`);
 *
 * // Use it - colors will be applied only if enabled in the environment
 * console.log(redText('Error message'));
 * ```
 *
 * @see isColorEnabled - Function that determines if colors should be used
 * @see AnsiFormatterType - Type definition for ANSI formatting functions
 *
 * @since 1.0.0
 */

export function wrap(styleFn: AnsiFormatterType): AnsiFormatterType {
    return (...texts: Array<string>) => isColorEnabled() ? styleFn(...texts) : texts.join('');
}

/**
 * Formats text with dimmed styling for less emphasized content.
 *
 * @param text - The text to format with dim styling
 * @returns The text wrapped with ANSI dim styling codes
 *
 * @since 1.0.0
 */

export const DIM = wrap(xterm.dim);

/**
 * Formats text with light orange highlighting for important values.
 *
 * @param text - The text to format in lightOrange
 * @returns The text wrapped with ANSI light orange styling codes
 *
 * @since 1.0.0
 */

export const MARK = wrap(xterm.lightOrange);

/**
 * Formats text in red, typically used for labeling received/actual values.
 *
 * @param text - The text to format in red
 * @returns The text wrapped with ANSI red styling codes
 *
 * @since 1.0.0
 */

export const RECEIVED = wrap(xterm.red);

/**
 * Formats text in green, typically used for labeling expected values.
 *
 * @param text - The text to format in green
 * @returns The text wrapped with ANSI green styling codes
 *
 * @since 1.0.0
 */

export const EXPECTED = wrap(xterm.green);

/**
 * Formats text in cyan color.
 *
 * @param text - The text to format in cyan
 * @returns The text wrapped with ANSI cyan styling codes
 *
 * @since 1.0.0
 */

export const CYAN = wrap(xterm.cyan);

/**
 * Formats text with inverse styling (swapping foreground and background colors).
 *
 * @param text - The text to format with inverse styling
 * @returns The text wrapped with ANSI inverse styling codes
 *
 * @since 1.0.0
 */

export const INVERSE = wrap(xterm.inverse);

/**
 * Formats text with bright white styling, typically used for titles or headings.
 *
 * @param text - The text to format in bright white
 * @returns The text wrapped with ANSI bright white styling codes
 *
 * @since 1.0.0
 */

export const TITLE = wrap(xterm.whiteBright);
