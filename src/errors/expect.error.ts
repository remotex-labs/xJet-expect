/**
 * Import will remove at compile time
 */

import type { AssertionResultInterface, OptionsExpectErrorInterface } from '@errors/interfaces/expect-error.interface';

/**
 * Imports
 */

import { xJetBaseError } from '@errors/base.error';
import { composeStatement } from '@components/format.component';

/**
 * Error class representing an expectation failure in xJet framework.
 *
 * @remarks
 * This error encapsulates details from matcher evaluation results,
 * including pass/fail status and error messages.
 *
 * The error message is composed of the formatted assertion statement and optional info lines.
 *
 * @since 1.0.0
 */

export class xJetExpectError extends xJetBaseError {
    /**
     * The result of the matcher function evaluation.
     *
     * @remarks
     * This optional property stores the result returned from a matcher function
     * when executed against the actual value. The result object contains important
     * information about the assertion outcome, including whether it passed or failed,
     * and custom error messages.
     *
     * When a matcher is executed, it returns an object conforming to the AssertionResultInterface,
     * which typically includes:
     * - pass: A boolean indicating if the assertion passed
     * - message: A function or string representing the formatted error message
     * - expected: The expected value for comparison
     * - received: The actual value received
     *
     * This property may be undefined when the error is generated before a matcher
     * function is executed, such as when an invalid promise is provided.
     *
     * @see AssertionResultInterface
     *
     * @since 1.0.0
     */

    matcherResult?: AssertionResultInterface;

    /**
     * Creates a new xJetExpectError instance.
     *
     * @param options - Options containing assertion details and optional info lines.
     *
     * @see OptionsExpectErrorInterface
     *
     * @since 1.0.0
     */

    constructor(options: OptionsExpectErrorInterface) {
        const lines = [ `${ composeStatement(options) }\n` ];
        if (options.info) lines.push(...options.info);

        super(lines.join('\n'));
        if (options.assertion) {
            this.matcherResult = options.assertion;
            this.matcherResult.message = this.message;
        }
    }
}
