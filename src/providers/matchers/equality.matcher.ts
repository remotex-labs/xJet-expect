/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { EXPECTED, RECEIVED } from '@components/color.component';
import { equals, isAsymmetric } from '@components/object.component';
import { handleDiffFailure, handleFailure, serializeOneLine } from '@handlers/matchers.handler';

/**
 * Checks if the received value is exactly the expected value using Object.is,
 * or matches an asymmetric matcher.
 *
 * @param expected - The expected value or asymmetric matcher.
 *
 * @remarks
 * Uses Object.is for strict equality comparison unless an asymmetric matcher
 * is provided, which will be used to match the received value.
 *
 * If the check fails but the values are deeply equal,
 * a note suggests using "toEqual" instead.
 *
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(['hello']).toBe(['hello']); // Fails because arrays differ by reference
 * expect(['hello']).toBe(expect.arrayContaining(['hello'])); // Passes with asymmetric matcher
 * ```
 *
 * @since 1.0.0
 */

export function toBe(this: MatcherService, expected: unknown): void {
    const pass = isAsymmetric(expected)
        ? expected.matches(this.received)
        : Object.is(this.received, expected);

    const note =
        !pass && equals(this.received, expected)
            ? 'If it should pass with deep equality, replace "toBe" with "toEqual"'
            : undefined;

    handleDiffFailure.call(this, {
        note,
        pass,
        expected,
        comment: 'Object.is equality',
        expectedLabels: [ 'expected' ]
    });
}

/**
 * Checks if the received value deeply equals the expected value.
 *
 * @param expected - The expected value to compare deeply against.
 *
 * @remarks
 * Uses deep equality comparison via `equals` function.
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect({ a: 1 }).toEqual({ a: 1 }); // Passes with deep equality
 * expect({ a: 1 }).toEqual(expect.objectContaining({ a: 1 })); // Passes with asymmetric matcher
 * ```
 *
 * @since 1.0.0
 */

export function toEqual(this: MatcherService, expected: unknown): void {
    const pass = equals(this.received, expected);
    handleDiffFailure.call(this, {
        pass,
        expected,
        comment: 'deep equality',
        expectedLabels: [ 'expected' ]
    });
}

/**
 * Checks if the received value is exactly null.
 *
 * @remarks
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(null).toBeNull(); // Passes
 * expect(undefined).toBeNull(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeNull(this: MatcherService): void {
    const pass = this.received === null;
    handleDiffFailure.call(this, {
        pass,
        expected: null
    });
}

/**
 * Checks if the received value is exactly undefined.
 *
 * @remarks
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(undefined).toBeUndefined(); // Passes
 * expect(null).toBeUndefined(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeUndefined(this: MatcherService): void {
    const pass = this.received === undefined;
    handleDiffFailure.call(this, {
        pass,
        expected: undefined
    });
}

/**
 * Checks if the received value is NaN.
 *
 * @remarks
 * Uses Number.isNaN for validation.
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(NaN).toBeNaN(); // Passes
 * expect(0 / 0).toBeNaN(); // Passes
 * expect(1).toBeNaN(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeNaN(this: MatcherService): void {
    const pass = Number.isNaN(this.received);
    handleDiffFailure.call(this, {
        pass,
        expected: NaN
    });
}

/**
 * Checks if the received value is truthy.
 *
 * @remarks
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(1).toBeTruthy(); // Passes
 * expect('non-empty string').toBeTruthy(); // Passes
 * expect(false).toBeTruthy(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeTruthy(this: MatcherService): void {
    const pass = !!this.received;
    handleDiffFailure.call(this, {
        pass,
        expected: true
    });
}

/**
 * Checks if the received value is falsy.
 *
 * @remarks
 * Throws an error if the assertion fails.
 *
 * @example
 * ```ts
 * expect(0).toBeFalsy(); // Passes
 * expect('').toBeFalsy(); // Passes
 * expect(true).toBeFalsy(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeFalsy(this: MatcherService): void {
    const pass = !this.received;
    handleDiffFailure.call(this, {
        pass,
        expected: false
    });
}


/**
 * Checks if the received value is defined (not undefined).
 *
 * @remarks
 * Throws an error if the assertion fails.
 * Provides custom messages for "not" modifier showing expected and received values.
 *
 * @example
 * ```ts
 * expect('value').toBeDefined(); // Passes
 * expect(undefined).toBeDefined(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeDefined(this: MatcherService): void {
    const pass = this.received !== void 0;
    handleFailure.call(this, {
        pass,
        expected: undefined,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ EXPECTED(serializeOneLine(undefined)) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Received: ${ RECEIVED(serializeOneLine(this.received)) }`);
        }
    });
}
