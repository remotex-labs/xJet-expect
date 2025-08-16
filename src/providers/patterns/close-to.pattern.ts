/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Asymmetric matcher that checks if a number is close to an expected value within a specified precision.
 *
 * Supports optional inversion of the match result.
 *
 * @param inverse - Indicates whether the match result should be inverted
 * @param expected - The expected numeric value to compare against
 * @param precision - Number of decimal digits for precision (default is 2)
 *
 * @remarks
 * Use `CloseToPattern.create` to instantiate this matcher.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.closeTo(3.14, 2));
 * ```
 *
 * @since 1.0.0
 */

export class CloseToPattern extends AbstractPattern {
    /**
     * Constructs a new `CloseToPattern`.
     *
     * @param inverse - Whether to invert the match result
     * @param expected - The expected numeric value
     * @param precision - Decimal precision, defaults to 2
     *
     * @since 1.0.0
     */

    private constructor(inverse: boolean, public readonly expected: number, public readonly precision: number = 2) {
        super('CloseTo', inverse);
    }

    /**
     * Creates a `CloseToPattern` matcher.
     *
     * @param inverse - Whether to invert the match result
     * @param expected - The expected numeric value
     * @param precision - Optional decimal precision
     *
     * @returns A new `CloseToPattern` instance
     *
     * @since 1.0.0
     */

    static create(inverse: boolean, expected: number, precision?: number): CloseToPattern {
        return new CloseToPattern(inverse, expected, precision);
    }

    /**
     * A label describing the expected close-to pattern.
     *
     * @returns A string describing the expected value and precision, indicating inversion if applicable
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        const not = this.isInverse ? 'Not ' : '';
        const precisionLabel = this.precision !== 1 ? 's' : '';

        return `${ not }CloseTo(${ this.expected }, ${ this.precision } digit${ precisionLabel })`;
    }

    /**
     * Determines whether the received value is close to the expected value within the specified precision.
     *
     * @param received - The value to test
     *
     * @returns True if the value is within the precision range; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        const sample: unknown = this.expected;

        if (typeof received !== 'number' || typeof sample !== 'number')
            return this.applyInverse(false);

        return this.applyInverse(
            Math.abs(received - sample) < Math.pow(10, -this.precision) / 2
        );
    }
}
