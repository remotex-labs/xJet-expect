/**
 * Imports
 */

import { serialize } from '@components/serialize.component';
import { AbstractPattern } from '@patterns/abstract.pattern';
import { equals, isAsymmetric, hasKey } from '@components/object.component';

/**
 * Asymmetric matcher that checks if an object contains the expected key-value pairs.
 *
 * Supports optional inversion of the match result.
 *
 * @param isInverse - Indicates whether the match result should be inverted
 * @param expected - A plain object containing key-value pairs expected to be present
 *
 * @remarks
 * Use `ObjectContainingPattern.create` to instantiate this matcher.
 * Throws a `TypeError` if `expected` is not a plain object.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.objectContaining({ foo: 'bar' }));
 * ```
 *
 * @since 1.0.0
 */

export class ObjectContainingPattern extends AbstractPattern {
    /**
     * Constructs a new `ObjectContainingPattern`.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected key-value pairs to match
     *
     * @since 1.0.0
     */

    private constructor(isInverse: boolean, private readonly expected: Record<string, unknown>) {
        super('ObjectContaining', isInverse);
    }

    /**
     * Creates an `ObjectContainingPattern` matcher.
     *
     * @param isInverse - Whether to invert the match result
     * @param expected - The expected key-value pairs
     *
     * @returns A new `ObjectContainingPattern` instance
     *
     * @throws TypeError - If `expected` is not a plain object
     *
     * @since 1.0.0
     */

    static create(isInverse: boolean, expected: Record<string, unknown>): ObjectContainingPattern {
        if (typeof expected !== 'object' || expected === null || Array.isArray(expected)) {
            throw new TypeError('objectContaining() expects a plain object.');
        }

        return new ObjectContainingPattern(isInverse, expected);
    }

    /**
     * A label describing the expected object containing pattern.
     *
     * @returns A string indicating the expected key-value pairs and inversion status
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return `${ this.isInverse ? 'Not ' : '' }ObjectContaining(${ this.describe(this.expected) })`;
    }

    /**
     * Determines whether the received object contains all expected key-value pairs.
     *
     * @param received - The object to test
     *
     * @returns True if all expected pairs are contained; otherwise false (inverted if `isInverse` is true)
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (typeof received !== 'object' || received === null) {
            return this.applyInverse(false);
        }

        const allMatch = Object.keys(this.expected).every((key) => {
            if (!hasKey(received, key)) return false;

            return this.matchElement((received as Record<string, unknown>)[key], this.expected[key]);
        });

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
     * Returns a string description of the expected value, supporting asymmetric matchers.
     *
     * @param value - The value to describe
     *
     * @returns A string description of the value
     *
     * @since 1.0.0
     */

    private describe(value: unknown): string {
        if (isAsymmetric(value)) return value.expectedLabel;

        return serialize(value, '').join(' ');
    }
}
