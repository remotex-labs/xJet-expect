/**
 * Imports
 */

import { serialize } from '@components/serialize.component';
import { AbstractPattern } from '@patterns/abstract.pattern';
import { equals, isAsymmetric } from '@components/object.component';

/**
 * Asymmetric matcher that checks if every element in an array matches a given matcher or value.
 *
 * Supports optional inversion of the match result.
 *
 * @param isInverse - Indicates whether the match result should be inverted
 * @param expected - The matcher or value that each element is expected to match
 *
 * @remarks
 * Use `ArrayOfPattern.create` to instantiate this matcher. Throws a `TypeError` if `expected` is `undefined`.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.arrayOf(42));
 * ```
 *
 * @since 1.0.0
 */

export class ArrayOfPattern extends AbstractPattern {
    /**
     * Constructs a new `ArrayOfPattern`.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected matcher or value for each element
     *
     * @since 1.0.0
     */

    private constructor(isInverse: boolean, private expected: unknown) {
        super('ArrayOf', isInverse);
    }

    /**
     * Creates an `ArrayOfPattern` matcher.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The matcher or value that each element should match
     *
     * @returns A new `ArrayOfPattern` instance
     *
     * @throws TypeError - If `expected` is `undefined`
     *
     * @since 1.0.0
     */

    static create(isInverse: boolean, expected: unknown): ArrayOfPattern {
        if (expected === undefined) {
            throw new TypeError('arrayOf() expects a matcher or value.');
        }

        return new ArrayOfPattern(isInverse, expected);
    }

    /**
     * A label describing the expected array-of pattern.
     *
     * @returns A string indicating the expected matcher/value and inversion status
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return `${ this.isInverse ? 'Not ' : '' }ArrayOf( ${ this.describe(this.expected) } )`;
    }

    /**
     * Determines whether every element in the received array matches the expected matcher or value.
     *
     * @param received - The array to test
     *
     * @returns True if all elements match; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (!Array.isArray(received)) {
            return this.applyInverse(false);
        }

        // Check every element matches elementMatcher
        const allMatch = received.every((item) => this.matchElement(item, this.expected));

        return this.applyInverse(allMatch);
    }

    /**
     * Tests whether an item matches a matcher or equals a value, supporting asymmetric matchers.
     *
     * @param item - The actual item to test
     * @param matcher - The matcher or value to compare against
     *
     * @returns True if the item matches the matcher or equals the value; otherwise false
     *
     * @since 1.0.0
     */

    private matchElement(item: unknown, matcher: unknown): boolean {
        if (isAsymmetric(matcher)) return matcher.matches(item);

        return equals(item, matcher);
    }

    /**
     * Returns a string description of the expected matcher or value, supporting asymmetric matchers.
     *
     * @param value - The value to describe
     *
     * @returns A string description of the value
     *
     * @since 1.0.0
     */

    private describe(value: unknown): string {
        if (isAsymmetric(value)) return value.expectedLabel;
        if (typeof value === 'string') return `"${ value }"`;

        return serialize(value, '').join(' ');
    }
}
