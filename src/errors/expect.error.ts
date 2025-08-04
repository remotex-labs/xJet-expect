import type { AssertionResultInterface, OptionsExpectErrorInterface } from '@errors/interfaces/expect-error.interface';
import { xJetBaseError } from '@errors/base.error';
import { hintComponent } from '@components/format.component';

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
     * - message: A function that returns a formatted error message
     * - actual: The actual value received
     * - expected: The expected value for comparison
     *
     * This property may be undefined when the error is generated before a matcher
     * function is executed, such as when an invalid promise is provided.
     *
     * see AssertionResultInterface
     *
     * @since 1.0.0
     */

    matcherResult?: AssertionResultInterface;

    constructor(options: OptionsExpectErrorInterface) {
        const lines = [ `${ hintComponent(options.hintChain, options.params || [], options.hintLabel) }\n` ];
        if (options.info) lines.push(...options.info);

        super(lines.join('\n'));
        if (options.assertion) {
            this.matcherResult = options.assertion;
            this.matcherResult.message = this.message;
        }
    }
}
