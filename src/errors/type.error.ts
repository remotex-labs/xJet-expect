/**
 * Import will remove at compile time
 */

import type { OptionsTypeErrorInterface } from '@errors/interfaces/type-error.interface';

/**
 * Imports
 */

import { xJetBaseError } from '@errors/base.error';
import { serialize } from '@components/serialize.component';
import { composeStatement } from '@components/format.component';
import { EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Error class for type mismatches and validation failures.
 *
 * @remarks
 * This specialized error provides detailed information about type mismatches,
 * including the expected and received values with their types.
 * The formatted message includes:
 * - A hint chain showing the context where the error occurred
 * - A specific error message describing the issue
 * - Type and value information for both expected and received values when available
 *
 * Color highlighting (via EXPECTED and RECEIVED) is applied to make the
 * differences stand out in terminal output.
 *
 * @see xJetBaseError
 * @see OptionsTypeErrorInterface
 *
 * @since 1.0.0
 */

export class xJetTypeError extends xJetBaseError {

    /**
     * Creates a new type error with formatted message showing the mismatch details.
     *
     * @param options - Configuration object containing error details.
     *
     * @remarks
     * This constructor builds a multi-line error message that clearly shows:
     * - The property path where the error occurred (via assertionChain)
     * - The specific error message
     * - Type and serialized value of the expected value (if provided)
     * - Type and serialized value of the received value (if provided)
     *
     * @see OptionsTypeErrorInterface
     *
     * @since 1.0.0
     */

    constructor(options: OptionsTypeErrorInterface) {
        const lines = [
            `${ composeStatement(options) }\n`,
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

        super(lines.join('\n'), 'xJetTypeError');
    }
}
