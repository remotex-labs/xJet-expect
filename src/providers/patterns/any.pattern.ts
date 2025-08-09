/**
 * Import will remove at compile time
 */

import type { ConstructorType } from '@interfaces/functions.interface';

/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Asymmetric matcher that matches any value of the specified constructor type.
 *
 * Supports common JavaScript types with specialized checks for primitive wrappers
 * and arrays, falling back to `instanceof` for other types.
 *
 * @throws TypeError - If called with `undefined` as the expected constructor
 *
 * @remarks
 * Use `AnyPattern.create` to instantiate the matcher. Throws a `TypeError` if called
 * without a constructor argument.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.any(Number));
 * ```
 *
 * @since 1.0.0
 */

export class AnyPattern extends AbstractPattern {
    /**
     * Map of constructor names to type-checking functions for common JavaScript types.
     *
     * Each function returns true if the given value matches the corresponding type,
     * including primitive wrappers and arrays.
     *
     * @since 1.0.0
     */

    private static readonly TYPE_CHECKS: Record<string, (value: unknown) => boolean> = {
        String: (actual) => typeof actual === 'string' || actual instanceof String,
        Number: (actual) => typeof actual === 'number' || actual instanceof Number,
        Function: (actual) => typeof actual === 'function' || actual instanceof Function,
        Boolean: (actual) => typeof actual === 'boolean' || actual instanceof Boolean,
        BigInt: (actual) => typeof actual === 'bigint' || actual instanceof BigInt,
        Symbol: (actual) => typeof actual === 'symbol' || actual instanceof Symbol,
        Object: (actual) => typeof actual === 'object',
        Array: Array.isArray
    };

    /**
     * Constructs a new `AnyPattern` instance with the specified expected constructor.
     *
     * @param expected - The constructor function this pattern will match against
     *
     * @since 1.0.0
     */

    private constructor(public readonly expected: ConstructorType) {
        super(`Any<${ expected.name }>`);
    }

    /**
     * Creates a new `AnyPattern` matcher for the specified constructor.
     *
     * @param expected - The constructor function to match values against
     * @returns A new `AnyPattern` instance
     *
     * @throws TypeError - If `expected` is `undefined`
     *
     * @example
     * ```ts
     * const matcher = AnyPattern.create(Number);
     * ```
     *
     * @since 1.0.0
     */

    static create(expected: ConstructorType): AnyPattern {
        if (expected === undefined) {
            throw new TypeError(
                'any() expects to be passed a constructor function. ' +
                'Please pass one or use anything() to match any object.'
            );
        }

        return new AnyPattern(expected);
    }

    /**
     * A label describing the expected constructor type.
     *
     * @returns A string of the form `Any<ConstructorName>`
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return `Any<${ this.expected.name }>`;
    }

    /**
     * Determines whether the received value matches the expected constructor type.
     *
     * @param received - The value to test
     * @returns True if the value matches the expected type; otherwise false
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        if (this.expected.name in AnyPattern.TYPE_CHECKS)
            return AnyPattern.TYPE_CHECKS[this.expected.name](received);

        return received instanceof this.expected;
    }
}
