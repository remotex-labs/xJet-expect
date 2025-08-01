/**
 * Import will remove at compile time
 */

import type { OptionsPromiseErrorInterface } from '@errors/interfaces/promise-error.interface';

/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { xJetBaseError } from '@errors/base.error';
import { RECEIVED } from '@components/color.component';
import { hintComponent } from '@components/format.component';

/**
 * Error class specialized for Promise-related failures
 *
 * @remarks
 * This specialized error class provides detailed information about promise-related errors,
 * including the context where the error occurred and the value that caused the error.
 * It formats the error message with clear visual separation between components for improved
 * readability in logs and console output.
 *
 * The error message includes:
 * - A hint chain showing the context where the error occurred
 * - A specific error message describing the issue
 * - The kind of value (resolved/rejected) and its serialized representation
 *
 * @example
 * ```ts
 * throw new xJetPromiseError({
 *   hintChain: this.hintChain,
 *   message: `${RECEIVED('received')} promise resolved instead of rejected`,
 *   value: this.actual,
 *   valueKind: 'Resolved'
 * });
 * ```
 *
 * @see OptionsPromiseErrorInterface
 * @since 1.0.0
 */

export class xJetPromiseError extends xJetBaseError {
    /**
     * Creates a new promise error with a formatted message showing error details
     *
     * @param options - Configuration object containing error details
     *
     * @remarks
     * This constructor builds a multi-line error message that clearly shows:
     * - The property path where the error occurred (via hintChain)
     * - The specific error message
     * - The kind of promise value (resolved/rejected) and its serialized representation
     *
     * The formatted value uses color highlighting (via RECEIVED function)
     * to make it stand out in terminal output.
     *
     * @example
     * ```ts
     * if(isResolved && this.rejectsModifiers) {
     *   throw new xJetPromiseError({
     *     hintChain: this.hintChain,
     *     message: `${RECEIVED('received')} promise resolved instead of rejected`,
     *     value: this.actual,
     *     valueKind: 'Resolved'
     *   });
     * }
     * ```
     *
     * @see OptionsPromiseErrorInterface
     * @since 1.0.0
     */

    constructor(options: OptionsPromiseErrorInterface) {
        const lines = [
            `${ hintComponent(options.hintChain, []) }\n`,
            `Matcher error: ${ options.message }`,
            `${ options.valueKind } to value: ${
                RECEIVED(serialize(options.value, '').join(' '))
            }`
        ];

        super(lines.join('\n'));
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
