/**
 * Import will remove at compile time
 */

import type { ComposeStatementInterface } from '@components/interfaces/format-component.interface';

/**
 * Imports
 */

import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Constructs a formatted Jest-style matcher statement string with optional ANSI coloring.
 *
 * Builds a string that resembles a Jest assertion call, e.g.:
 * `xExpect(received).toEqual(expected)` or `xExpect(received).rejects.toThrow()`,
 * with the ability to include multiple expected values and an optional trailing comment.
 *
 * @param options - Configuration options for composing the matcher statement.
 *   Properties:
 *   - `assertionChain`: Non-empty array of matcher methods (e.g., ['rejects', 'toThrow'])
 *   - `expectedLabels`: Array of expected argument labels, defaults to empty array
 *   - `receivedLabeled`: Label for the received value, defaults to 'received'
 *   - `comment`: Optional trailing comment appended after the statement
 *
 * @returns The fully formatted matcher statement as a string, including ANSI coloring if enabled
 *
 * @throws Error - Throws if `assertionChain` is empty or not provided
 *
 * @remarks
 * This function helps create consistent, colored assertion strings for testing frameworks
 * that support Jest-like matchers. It supports chaining matcher names and multiple expected arguments,
 * as well as adding inline comments for additional context.
 *
 * @example
 * ```ts
 * composeStatement({
 *   receivedLabeled: 'received',
 *   assertionChain: ['rejects', 'toThrow'],
 *   expectedLabels: [],
 *   comment: 'should throw an error'
 * });
 * // Returns: xExpect(received).rejects.toThrow() // should throw an error (with ANSI colors)
 *
 * composeStatement({
 *   assertionChain: ['toEqual'],
 *   expectedLabels: ['expectedValue']
 * });
 * // Returns: xExpect(received).toEqual(expectedValue) (with ANSI colors)
 * ```
 *
 * @default options.expectedLabels - []
 * @default options.receivedLabeled - 'received'
 *
 * @see ComposeStatementInterface - Interface for the `options` parameter
 *
 * @since 1.0.0
 */

export function composeStatement(options: ComposeStatementInterface): string {
    const { comment, assertionChain, expectedLabels = [], receivedLabeled = 'received' } = options;

    if (!assertionChain.length)
        throw new Error('Expected non-empty matcher chain (e.g., ["toEqual"]). Received an empty array.');

    const parts = [
        DIM('expect('),
        RECEIVED(receivedLabeled),
        DIM(')'),
        '.',
        assertionChain.join('.')
    ];

    if (expectedLabels.length > 0) {
        parts.push('(');
        parts.push(
            expectedLabels.map(value => EXPECTED(value)).join(', ')
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
