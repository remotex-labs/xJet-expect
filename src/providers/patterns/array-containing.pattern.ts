/**
 * Imports
 */

import { serialize } from '@components/serialize.component';
import { AbstractPattern } from '@patterns/abstract.pattern';
import { equals, isAsymmetric } from '@components/object.component';

/**
 * Asymmetric matcher that checks if an array contains all expected elements.
 *
 * Supports optional inversion of the match result.
 *
 * @param isInverse - Indicates whether the match result should be inverted
 * @param expected - The array of elements expected to be contained within the tested array
 *
 * @remarks
 * Use `ArrayContainingPattern.create` to instantiate this matcher. Throws a `TypeError` if the expected value is not an array.
 *
 * @example
 * ```ts
 * xExpect(value).toEqual(xExpect.arrayContaining([1, 2]));
 * ```
 *
 * @since 1.0.0
 */

export class ArrayContainingPattern extends AbstractPattern {
    /**
     * Constructs a new `ArrayContainingPattern`.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected array elements
     *
     * @since 1.0.0
     */

    private constructor(isInverse: boolean, private readonly expected: unknown[]) {
        super('ArrayContaining', isInverse);
    }

    /**
     * Creates an `ArrayContainingPattern` matcher.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected array elements
     *
     * @returns A new `ArrayContainingPattern` instance
     *
     * @throws TypeError - If `expected` is not an array
     *
     * @since 1.0.0
     */

    static create(isInverse: boolean, expected: Array<unknown>): ArrayContainingPattern {
        if (!Array.isArray(expected)) {
            throw new TypeError('arrayContaining() expects an array.');
        }

        return new ArrayContainingPattern(isInverse, expected);
    }

    /**
     * A label describing the expected array containing pattern.
     *
     * @returns A string indicating the expected elements and inversion status
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return `${ this.isInverse ? 'Not ' : '' }ArrayContaining(${ this.describe(this.expected) })`;
    }

    /**
     * Determines whether the received array contains all expected elements.
     *
     * @param received - The array to test
     *
     * @returns True if all expected elements are contained; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (!Array.isArray(received))
            return this.applyInverse(false);

        const allContained = this.expected.every((expItem) =>
            received.some((recItem) => this.matchElement(recItem, expItem))
        );

        return this.applyInverse(allContained);
    }

    /**
     * Tests whether an item matches a matcher, supporting asymmetric matchers.
     *
     * @param item - The actual item to test
     * @param matcher - The matcher or value to compare against
     *
     * @returns True if the item matches the matcher; otherwise false
     *
     * @since 1.0.0
     */

    private matchElement(item: unknown, matcher: unknown): boolean {
        if (isAsymmetric(matcher)) return matcher.matches(item);

        return equals(item, matcher);
    }

    /**
     * Returns a string description of the expected value, supporting asymmetric matchers.
     *
     * @param value - The value to describe
     * @returns A string description of the value
     *
     * @since 1.0.0
     */

    private describe(value: unknown): string {
        if (isAsymmetric(value)) return value.expectedLabel;

        return serialize(value, '').join(' ');
    }
}
