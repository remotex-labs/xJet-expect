/**
 * Import will remove at compile time
 */

import type { Matchers } from '@providers/matchers.provider';

/**
 * A mapped type that transforms matcher functions into method signatures with the same parameters
 * and return types, while also allowing for Promise-wrapped return values.
 *
 * @remarks
 * This type is used to create the fluent interface for the assertion library. It takes all
 * functions from the Matchers object and converts them into method signatures that can be
 * used on the MatcherService instance. Each method accepts the same parameters as the original
 * matcher function and returns either the original return type or a Promise-wrapped version
 * of that return type.
 *
 * The Promise return type handling allows matchers to work with both synchronous and
 * asynchronous assertions, particularly when used with the resolves/rejects modifiers.
 *
 *
 * @see Matchers - The source object containing all matcher implementations
 * @see PromisifiedMatchersType - Related type that enforces Promise-wrapped return values
 *
 * @since 1.0.0
 */

export type BoundMatchersType = {
    [K in keyof typeof Matchers]: (...args: Parameters<typeof Matchers[K]>) => ReturnType<typeof Matchers[K]> | Promise<ReturnType<typeof Matchers[K]>>
};

/**
 * A mapped type that transforms all matcher functions into method signatures with the same parameters
 * but with Promise-wrapped return types.
 *
 * @remarks
 * This type is used to create Promise-based assertion interfaces, particularly for testing asynchronous
 * code. It takes all functions from the Matchers object and converts them into method signatures that
 * return Promises resolving to the original return type.
 *
 * Unlike `BoundMatchersType`, which can return either the original type or a Promise, this type
 * enforces that all return values are wrapped in Promises. This is essential for providing
 * consistent behavior when working with asynchronous expectations.
 *
 * @example
 * ```ts
 * // If Matchers has:
 * const Matchers = {
 *   toBe: (this: MatcherService, expected: unknown): void => { ... }
 * };
 *
 * // PromisifiedMatchersType creates:
 * type Result = {
 *   toBe: (expected: unknown) => Promise<void>
 * };
 *
 * // Usage with `xExpect().resolves`:
 * await xExpect(Promise.resolve(42)).resolves.toBe(42);
 * ```
 *
 * @see Matchers - The source object containing all matcher implementations
 * @see BoundMatchersType - Related type that allows both synchronous and asynchronous returns
 *
 * @since 1.0.0
 */

export type PromisifiedMatchersType = {
    [K in keyof typeof Matchers]: (...args: Parameters<typeof Matchers[K]>) => Promise<ReturnType<typeof Matchers[K]>>;
};
