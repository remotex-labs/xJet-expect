/**
 * Import will remove at compile time
 */

import type { OptionsTypeErrorInterface } from '@errors/interfaces/type-error.interface';

/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { xJetBaseError } from '@errors/base.error';
import { hintComponent } from '@components/format.component';
import { EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Error class for type mismatches and validation failures
 *
 * @remarks
 * This specialized error class provides detailed information about type mismatches,
 * including the expected and received values with their types. It formats the error
 * message with clear visual separation between components for improved readability
 * in logs and console output.
 *
 * The error message includes:
 * - A hint chain showing the context where the error occurred
 * - A specific error message describing the issue
 * - Type and value information for both expected and received values when available
 *
 * @example
 * ```ts
 * throw new xJetTypeError({
 *   hintChain: ['user', 'profile', 'age'],
 *   message: 'Invalid age value',
 *   expected: { type: 'number', value: 'positive integer' },
 *   received: { type: 'string', value: '25abc' }
 * });
 * ```
 *
 * @see OptionsTypeErrorInterface
 *
 * @since 1.0.0
 */

export class xJetTypeError extends xJetBaseError {
    /**
     * Creates a new type error with formatted message showing the mismatch details
     *
     * @param options - Configuration object containing error details
     *
     * @remarks
     * This constructor builds a multi-line error message that clearly shows:
     * - The property path where the error occurred (via hintChain)
     * - The specific error message
     * - Type and serialized value of the expected value (if provided)
     * - Type and serialized value of the received value (if provided)
     *
     * The formatted values use color highlighting (via EXPECTED and RECEIVED functions)
     * to make the differences stand out in terminal output.
     *
     * @example
     * ```ts
     * new xJetTypeError({
     *   hintChain: ['config', 'timeout'],
     *   message: 'Invalid timeout value',
     *   expected: { type: 'number', value: 5000 },
     *   received: { type: 'string', value: '5s' }
     * });
     * // Creates an error with a message like:
     * // xJetTypeError: expect(received).config.timeout()
     * //
     * // Matcher error: Invalid timeout value
     * //
     * // Expected has type:  number
     * // Expected has value: 5000
     * // Received has type:  string
     * // Received has value: "5s"
     * ```
     *
     * @see OptionsTypeErrorInterface
     * @since 1.0.0
     */

    constructor(options: OptionsTypeErrorInterface) {
        const lines = [
            `${ hintComponent(options.name, options.hintChain, options?.params ?? []) }\n`,
            `Matcher error: ${ options.message }\n`
        ];

        if (options.expected) {
            if(options.expected.type) lines.push(`Expected has type:  ${ options.expected.type }`);
            lines.push(`Expected has value: ${
                EXPECTED(serialize(options.expected.value).join('\n'))
            }`);
        }

        if (options.received) {
            if(options.received.type) lines.push(`Received has type:  ${ options.received.type }`);
            lines.push(`Received has value: ${
                RECEIVED(serialize(options.received.value).join('\n'))
            }`);
        }

        super(lines.join('\n'));
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
