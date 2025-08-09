/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Asymmetric matcher that checks if a string matches an expected substring or regular expression.
 *
 * Supports optional inversion of the match result.
 *
 * @param isInverse - Indicates whether the match result should be inverted
 * @param expected - The string or RegExp pattern expected to be matched
 *
 * @remarks
 * Use `StringMatchingPattern.create` to instantiate this matcher.
 * Throws a `TypeError` if `expected` is not a string or RegExp.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.stringMatching('hello'));
 * expect(value).toEqual(expect.stringMatching(/world$/));
 * ```
 *
 * @since 1.0.0
 */

export class StringMatchingPattern extends AbstractPattern {
    /**
     * Constructs a new `StringMatchingPattern`.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected string or RegExp to match
     *
     * @since 1.0.0
     */

    private constructor(isInverse: boolean, private readonly expected: string | RegExp) {
        super('StringMatching', isInverse);
    }

    /**
     * Creates a `StringMatchingPattern` matcher.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The string or RegExp to match against
     *
     * @returns A new `StringMatchingPattern` instance
     *
     * @throws TypeError - If `expected` is not a string or RegExp, or is null/undefined
     *
     * @since 1.0.0
     */

    static create(isInverse: boolean, expected: string | RegExp): StringMatchingPattern {
        const expectedType = typeof expected;

        if (expected === undefined || expected === null)
            throw new TypeError('stringMatching() expects a string or RegExp.');

        if (expectedType !== 'string' && !(expected instanceof RegExp))
            throw new TypeError('stringMatching() expects a string or RegExp.');

        return new StringMatchingPattern(isInverse, expected);
    }

    /**
     * A label describing the expected string matching pattern.
     *
     * @returns A string indicating the expected substring or pattern and inversion status
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        const not = this.isInverse ? 'Not ' : '';
        if (typeof this.expected === 'string')
            return `${ not }stringMatching("${ this.expected }")`;

        return `${ not }stringMatching(${ this.expected.toString() })`;
    }

    /**
     * Determines whether the received string matches the expected substring or RegExp.
     *
     * @param received - The string to test
     *
     * @returns True if the string matches; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (typeof received !== 'string') {
            return this.applyInverse(false);
        }

        let pass: boolean;
        if (typeof this.expected === 'string') {
            pass = received.includes(this.expected);
        } else {
            pass = this.expected.test(received);
        }

        return this.applyInverse(pass);
    }
}
