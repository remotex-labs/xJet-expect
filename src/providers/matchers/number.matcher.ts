/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { NumericType } from '@matchers/interfaces/number-matcher.interface';

/**
 * Imports
 */

import { EXPECTED, RECEIVED } from '@components/color.component';
import { handleNumericComparison } from '@handlers/number.handler';
import { ensureType, handleFailure, serializeOneLine } from '@handlers/matchers.handler';

/**
 * Asserts that the received number is close to the expected number within a given decimal prevision.
 *
 * @param expected - The target number.
 * @param precision - The number of decimal places to check. Defaults to `2`.
 *
 * @remarks
 * Uses an absolute difference check with a tolerance of `10^(-precision) / 2`.
 * Works with both positive and negative numbers.
 *
 * @example
 * ```ts
 * expect(0.2 + 0.1).toBeCloseTo(0.3, 2); // Passes
 * ```
 *
 * @example
 * ```ts
 * expect(0.2 + 0.1).not.toBeCloseTo(0.3, 5); // Fails
 * ```
 *
 * @see handleFailure
 * @see throwIfNotNumber
 *
 * @since 1.0.0
 */

export function toBeCloseTo(this: MatcherService<number>, expected: number, precision: number = 2): void {
    const expectedLabels = [ 'expected', 'precision' ];
    ensureType.call(this, expected, [ 'number' ], 'Expected', expectedLabels);
    ensureType.call(this, this.received, [ 'number' ], 'Received', expectedLabels);

    const actual = this.received;
    const receivedDifference = Math.abs(expected - actual);
    const expectedDifference = Math.pow(10, -precision) / 2;
    const expectedDifferenceStr = (precision < 20) ? expectedDifference.toFixed(precision + 1) : expectedDifference.toString();

    const not = this.notModifier ? '      ' : '  ';
    const notLabel = this.notModifier ? 'not < ' : '< ';
    const pass = receivedDifference < expectedDifference;

    const details = [
        `Expected precision:  ${ not }${ EXPECTED(precision.toString()) }`,
        `Expected difference: ${ notLabel }${ EXPECTED(expectedDifferenceStr) }`,
        `Received difference: ${ not }${ RECEIVED(receivedDifference.toString()) }`
    ];

    handleFailure.call(this, {
        pass,
        expectedLabels,
        handleNot(info) {
            info.push(`Expected: not ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push(`Received:     ${ RECEIVED(serializeOneLine(actual)) }\n`);
            info.push(...details);
        },
        handleInfo(info) {
            info.push(`Expected: ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push(`Received: ${ RECEIVED(serializeOneLine(actual)) }\n`);
            info.push(...details);
        }
    });
}

/**
 * Asserts that the received value is greater than the expected value.
 *
 * @param expected - The value to compare against.
 *
 * @example
 * ```ts
 * expect(10).toBeGreaterThan(5); // Passes
 * ```
 *
 * @example
 * ```ts
 * expect(5).toBeGreaterThan(10); // Fails
 * ```
 *
 * @see handleNumericComparison
 * @since 1.0.0
 */

export function toBeGreaterThan(this: MatcherService<NumericType>, expected: NumericType): void {
    handleNumericComparison.call(this, expected, '>');
}

/**
 * Asserts that the received value is greater than or equal to the expected value.
 *
 * @param expected - The value to compare against.
 *
 * @example
 * ```ts
 * expect(5).toBeGreaterThanOrEqual(5); // Passes
 * ```
 *
 * @example
 * ```ts
 * expect(4).toBeGreaterThanOrEqual(5); // Fails
 * ```
 *
 * @see handleNumericComparison
 * @since 1.0.0
 */

export function toBeGreaterThanOrEqual(this: MatcherService<NumericType>, expected: NumericType): void {
    handleNumericComparison.call(this, expected, '>=');
}

/**
 * Asserts that the received value is less than the expected value.
 *
 * @param expected - The value to compare against.
 *
 * @example
 * ```ts
 * expect(3).toBeLessThan(5); // Passes
 * ```
 *
 * @example
 * ```ts
 * expect(6).toBeLessThan(5); // Fails
 * ```
 *
 * @see handleNumericComparison
 *
 * @since 1.0.0
 */

export function toBeLessThan(this: MatcherService<NumericType>, expected: NumericType): void {
    handleNumericComparison.call(this, expected, '<');
}

/**
 * Asserts that the received value is less than or equal to the expected value.
 *
 * @param expected - The value to compare against.
 *
 * @example
 * ```ts
 * expect(5).toBeLessThanOrEqual(5); // Passes
 * ```
 *
 * @example
 * ```ts
 * expect(7).toBeLessThanOrEqual(5); // Fails
 * ```
 *
 * @see handleNumericComparison
 * @since 1.0.0
 */

export function toBeLessThanOrEqual(this: MatcherService<NumericType>, expected: NumericType): void {
    handleNumericComparison.call(this, expected, '<=');
}
