/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Asymmetric matcher that matches any non-null and non-undefined value.
 *
 * @remarks
 * Use `AnythingPattern.create` to instantiate this matcher.
 *
 * @example
 * ```ts
 * expect(value).toEqual(expect.anything());
 * ```
 *
 * @since 1.0.0
 */

export class AnythingPattern extends AbstractPattern {
    /**
     * Constructs a new `AnythingPattern` instance.
     *
     * @since 1.0.0
     */

    private constructor() {
        super('Anything');
    }

    /**
     * Creates a new `AnythingPattern` matcher.
     *
     * @returns A new `AnythingPattern` instance
     *
     * @since 1.0.0
     */

    static create(): AnythingPattern {
        return new AnythingPattern();
    }

    /**
     * A label describing the expected pattern.
     *
     * @returns The string `'Anything'`
     *
     * @since 1.0.0
     */

    get expectedLabel(): string {
        return 'Anything';
    }

    /**
     * Determines whether the received value is not `null` or `undefined`.
     *
     * @param received - The value to test
     *
     * @returns True if the value is not `null` or `undefined`; otherwise false
     *
     * @since 1.0.0
     */

    matches(received: unknown): boolean {
        return received != null;
    }
}
