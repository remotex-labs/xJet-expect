/**
 * Imports
 */

import { xterm } from '@remotex-labs/xansi';

/**
 * Formats text with dimmed styling for less emphasized content.
 *
 * @param text - The text to format with dim styling
 * @returns The text wrapped with ANSI dim styling codes
 *
 * @since 1.0.0
 */

export const DIM = xterm.dim;

/**
 * Formats text with light orange highlighting for important values.
 *
 * @param text - The text to format in lightOrange
 * @returns The text wrapped with ANSI light orange styling codes
 *
 * @since 1.0.0
 */

export const MARK = xterm.lightOrange;

/**
 * Formats text in red, typically used for labeling received/actual values.
 *
 * @param text - The text to format in red
 * @returns The text wrapped with ANSI red styling codes
 *
 * @since 1.0.0
 */

export const RECEIVED = xterm.red;

/**
 * Formats text in green, typically used for labeling expected values.
 *
 * @param text - The text to format in green
 * @returns The text wrapped with ANSI green styling codes
 *
 * @since 1.0.0
 */

export const EXPECTED = xterm.green;

/**
 * Formats text in cyan color.
 *
 * @param text - The text to format in cyan
 * @returns The text wrapped with ANSI cyan styling codes
 *
 * @since 1.0.0
 */

export const CYAN = xterm.cyan;

/**
 * Formats text with inverse styling (swapping foreground and background colors).
 *
 * @param text - The text to format with inverse styling
 * @returns The text wrapped with ANSI inverse styling codes
 *
 * @since 1.0.0
 */

export const INVERSE = xterm.inverse;

/**
 * Formats text with bright white styling, typically used for titles or headings.
 *
 * @param text - The text to format in bright white
 * @returns The text wrapped with ANSI bright white styling codes
 *
 * @since 1.0.0
 */

export const TITLE = xterm.whiteBright;
