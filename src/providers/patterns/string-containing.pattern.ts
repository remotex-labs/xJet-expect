/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Asymmetric matcher that checks if a string contains the expected substring.
 *
 * Supports optional inversion of the match result.
 *
 * @param isInverse - Indicates whether the match result should be inverted
 * @param expected - The substring expected to be contained within the tested string
 *
 * @remarks
 * Use `StringContainingPattern.create` to instantiate this matcher. Throws a `TypeError` if the expected value is not a string.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.stringContaining('hello'));
 * ```
 *
 * @since 1.0.0
 */

export class StringContainingPattern extends AbstractPattern {
    /**
     * Constructs a new `StringContainingPattern`.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected substring
     *
     * @since 1.0.0
     */

    private constructor(isInverse: boolean, public readonly expected: string) {
        super('StringContaining', isInverse);
    }

    /**
     * Creates a `StringContainingPattern` matcher.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected substring
     *
     * @returns A new `StringContainingPattern` instance
     *
     * @throws TypeError - If `expected` is not a string
     *
     * @since 1.0.0
     */

    static create(isInverse: boolean, expected: string): StringContainingPattern {
        const expectedType = typeof expected;
        if (expectedType !== 'string')
            throw new TypeError('stringContaining() expects a string.');

        return new StringContainingPattern(isInverse, expected);
    }

    /**
     * A label describing the expected string containing a pattern.
     *
     * @returns A string indicating the expected substring and inversion status
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return `${ this.isInverse ? 'Not ' : '' }stringContaining("${ this.expected }")`;
    }

    /**
     * Determines whether the received string contains the expected substring.
     *
     * @param received - The string to test
     *
     * @returns True if the string contains the substring; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (typeof received !== 'string') {
            return this.applyInverse(false);
        }

        return this.applyInverse(received.includes(this.expected));
    }
}
