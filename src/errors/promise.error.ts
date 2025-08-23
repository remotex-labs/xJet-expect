/**
 * Import will remove at compile time
 */

import type { OptionsPromiseErrorInterface } from '@errors/interfaces/promise-error.interface';

/**
 * Imports
 */

import { xJetBaseError } from '@errors/base.error';
import { RECEIVED } from '@components/color.component';
import { serialize } from '@components/serialize.component';
import { composeStatement } from '@components/format.component';

/**
 * Error type representing a failed Promise-related matcher assertion.
 *
 * @remarks
 * Extends xJetBaseError to provide a formatted, Jest-style error message
 * for failed promise expectations. The message includes:
 * - A matcher statement from the provided assertion chain.
 * - A clear description of the matcher failure.
 * - The kind of promise result (`Resolved` or `Rejected`) and its serialized value.
 *
 * Formatting is handled using:
 * - composeStatement to construct the matcher statement.
 * - RECEIVED for styling the received value.
 * - serialize to generate a readable string representation.
 *
 * @example
 * ```ts
 * throw new xJetPromiseError({
 *   message: `${RECEIVED('received')} promise resolved instead of rejected`,
 *   received: myValue,
 *   promiseKind: 'Resolved',
 *   assertionChain: ['rejects', 'toThrow'],
 * });
 * ```
 *
 * @see RECEIVED
 * @see serialize
 * @see composeStatement
 * @see OptionsPromiseErrorInterface
 *
 * @since 1.0.0
 */

export class xJetPromiseError extends xJetBaseError {

    /**
     * Creates an xJetPromiseError instance with a formatted,
     * Jest-style matcher error message for promise-related failures.
     *
     * @param options - Configuration object containing the matcher
     * details, failure message, received value, and result kind.
     *
     * @throws Error - If the assertion chain is empty
     * (thrown by composeStatement).
     *
     * @see composeStatement
     * @see OptionsPromiseErrorInterface
     *
     * @since 1.0.0
     */

    constructor(options: OptionsPromiseErrorInterface) {
        const lines = [
            `${ composeStatement(options) }\n`,
            `Matcher error: ${ options.message }`,
            `${ options.promiseKind } to value: ${
                RECEIVED(serialize(options.received, '').join(' '))
            }`
        ];

        super(lines.join('\n'), 'xJetPromiseError');
    }
}
