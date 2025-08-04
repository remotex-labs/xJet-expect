/**
 * Imports
 */

import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Generates a formatted code hint showing the expected assertion syntax.
 *
 * @param chain - Array of matcher segments representing the assertion chain
 * @param parameters - Optional array of parameter names (defaults to ['expected'])
 * @param comment - Optional explanatory comment to append to the hint
 * @returns A formatted string showing the proper assertion syntax with styling
 *
 * @throws Error - If an empty array is provided as the matcher chain
 *
 * @remarks
 * This function creates a visual representation of how the assertion should be structured,
 * using ANSI styling for better readability in terminal output. The hint shows a properly
 * formatted assertion chain with placeholders for the received and expected values.
 *
 * @example
 * ```ts
 * // Simple matcher
 * hintComponent(['toBe']);
 * // Output: expect(received).toBe(expected)
 *
 * // Chained matcher with comment
 * hintComponent(['not', 'toEqual'], 'values should differ');
 * // Output: expect(received).not.toEqual(expected) // values should differ
 * ```
 *
 * @since 1.0.0
 */

export function hintComponent(chain: Array<string>, parameters: Array<string> = [ 'expected' ], comment?: string): string {
    if (chain.length < 1)
        throw new Error('Expected non-empty matcher chain (e.g., ["toEqual"]). Received an empty array.');

    const parts = [
        DIM('expect('),
        RECEIVED('received'),
        DIM(')'),
        '.',
        chain.join('.')
    ];

    if (parameters.length > 0) {
        parts.push('(');
        parts.push(
            parameters.map(value => EXPECTED(value)).join(', ')
        );
        parts.push(')');
    } else {
        parts.push('()');
    }

    if (comment) {
        parts.push(DIM(' // ' + comment));
    }

    return parts.join('');
}
