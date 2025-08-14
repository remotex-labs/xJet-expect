/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { NumberOperatorType, NumericType } from '@matchers/interfaces/number-matcher.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { getType } from '@diff/components/diff.component';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { ensureType, handleComparisonFailure } from '@handlers/matchers.handler';

/**
 * Ensures that the provided value is a positive number or bigint.
 *
 * @param value - The value to validate.
 * @param label - Label describing the value (e.g., `'Received'` or `'Expected'`).
 * @param expectedLabels - Optional list of expected value descriptions for error reporting.
 *
 * @throws xJetTypeError - Thrown if the value is not a number or bigint, or if it is less than zero.
 *
 * @remarks
 * This method first validates that the type of `value` is `number` or `bigint`
 * via {@link ensureType}, then asserts that the numeric value is greater than or equal to zero.
 * If the validation fails, an {@link xJetTypeError} is thrown with contextual details.
 *
 * @see ensureType
 * @see xJetTypeError
 *
 * @since 1.0.0
 */

export function ensurePositiveNumber(this: MatcherService, value: unknown, label: string, expectedLabels: Array<string> = []): void {
    ensureType.call(this, value, [ 'number', 'bigint' ], label, expectedLabels);

    if (<number> value < 0) {
        throw new xJetTypeError({
            expectedLabels,
            assertionChain: this.assertionChain,
            message: `${ (label === 'Received' ? RECEIVED : EXPECTED)(label) } value must be positive number`,
            [label === 'Received' ? 'received' : 'expected']: { value, type: getType(value) }
        });
    }
}

/**
 * Performs a numeric comparison between the received and expected values, then delegates failure handling.
 *
 * @param expected - The expected numeric value.
 * @param operator - The comparison operator (`'>'`, `'>='`, `'<'`, `'<='`).
 * @param matcherName - The name of the matcher invoking this comparison.
 *
 * @remarks
 * This is the core comparison logic shared by `toBeGreaterThan`, `toBeGreaterThanOrEqual`,
 * `toBeLessThan`, and `toBeLessThanOrEqual`.
 *
 * @example
 * ```ts
 * handleNumericComparison.call({ received: 5, notModifier: false }, 3, '>', 'toBeGreaterThan');
 * // Passes silently
 * ```
 *
 * @example
 * ```ts
 * handleNumericComparison.call({ received: 2, notModifier: false }, 5, '>', 'toBeGreaterThan');
 * // Throws a comparison failure
 * ```
 *
 * @see toBeLessThan
 * @see toBeGreaterThan
 *
 * @since 1.0.0
 */

export function handleNumericComparison(
    this: MatcherService<NumericType>, expected: NumericType, operator: NumberOperatorType
): void {
    const received = this.received;
    const expectedLabels = [ 'Expected' ];
    ensureType.call(this, expected, [ 'number', 'bigint' ], 'Expected', expectedLabels);
    ensureType.call(this, received, [ 'number', 'bigint' ], 'Received', expectedLabels);

    let pass: boolean;
    switch (operator) {
        case '>':
            pass = received > expected;
            break;
        case '>=':
            pass = received >= expected;
            break;
        case '<':
            pass = received < expected;
            break;
        case '<=':
            pass = received <= expected;
            break;
        default:
            pass = false;
    }

    handleComparisonFailure.call(this, { pass, expectedLabels }, operator);
}
