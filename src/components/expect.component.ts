/**
 * Import will remove at compile time
 */

import type { BoundMatchersType } from '@interfaces/matchers.interface';

/**
 * Imports
 */

import { Matchers } from '@providers/matchers.provider';
import { Patterns } from '@providers/patterns.provider';
import { MatcherService } from '@services/matcher.service';

/**
 * Dynamically adds matcher methods to the MatcherService prototype by iterating through
 * the Matchers object and defining properties for each matcher function.
 *
 * @remarks
 * This code creates a dynamic interface for matchers by:
 * 1. Iterating through each key in Matchers object
 * 2. Retrieving the corresponding matcher function
 * 3. Defining a property on the MatcherService prototype with the same name
 * 4. The property value is a function that invokes the matcher via the MatcherService.invoke method
 *
 * This approach allows for extending the matcher functionality without modifying the
 * MatcherService class directly. Each matcher function is bound to the MatcherService
 * instance context when invoked.
 *
 * @example
 * ```ts
 * // Define a matcher in Matchers object
 * const Matchers = {
 *   isTrue: function(this: MatcherService) {
 *     return this.invoke('isTrue', (actual) => actual === true);
 *   }
 * };
 *
 * // The above code will automatically make this available:
 * xExpect(value).isTrue();
 * ```
 *
 * @see Matchers - The object containing all matcher functions
 * @see MatcherService - The service that processes and executes matchers
 *
 * @since 1.0.0
 */

for (const key of Object.keys(Matchers) as Array<keyof typeof Matchers>) {
    const proto = <MatcherService & BoundMatchersType> MatcherService.prototype;
    const matcherFn = Matchers[key];

    Object.defineProperty(proto, key, {
        value: function (...args: Array<unknown>) {
            return this.invoke(key, matcherFn, args);
        }
    });

    Object.defineProperty(proto[key], 'name', { value: key });
}

/**
 * Creates a new matcher service instance for the provided actual value to perform assertions against.
 *
 * @param received - The value to perform assertions on
 * @param rest - Additional arguments (not supported, included only for error handling)
 * @returns An augmented MatcherService instance with bound matcher methods
 *
 * @throws Error - When more than one argument is provided to the function
 *
 * @remarks
 * This function serves as the core implementation of the xExpect function. It creates a new
 * MatcherService instance with the provided value and augments it with all available matcher
 * methods defined in the BoundMatchersType. The resulting object provides a fluent API for
 * writing test assertions.
 *
 * @example
 * ```ts
 * // Basic usage with a single argument
 * const result = coreExpect(42);
 * result.toBe(42); // Passes
 *
 * // Will throw an error due to extra arguments
 * coreExpect(42, 'extra'); // Error: Expect takes at most one argument
 * ```
 *
 * @see MatcherService - The service that processes and executes matchers
 * @see BoundMatchersType - The type that defines all available matcher methods
 *
 * @since 1.0.0
 */

const coreExpect = (received: unknown, ...rest: Array<never>): MatcherService & BoundMatchersType => {
    if (rest.length > 0) {
        throw new Error(`Expect takes at most one argument. Received ${ rest.length + 1 } arguments instead.`);
    }

    return new MatcherService(received) as MatcherService & BoundMatchersType;
};

/**
 * Main assertion function that creates a new matcher service for the provided value and
 * extends it with additional pattern matching utilities.
 *
 * @remarks
 * This is the primary entry point for the assertion library. It combines the core expect
 * functionality with pattern matchers that allow for powerful asymmetric matching.
 * The `Object.assign` merges the core assertion function with pattern matchers, making
 * them available as properties on the xExpect function itself.
 *
 * @example
 * ```ts
 * // Basic value assertion
 * xExpect(value).toBe(expected);
 *
 * // Using pattern matchers
 * xExpect(value).toEqual(xExpect.any(Number));
 *
 * // Direct use of patterns
 * const matcher = xExpect.any(String);
 * ```
 *
 * @see coreExpect - The base assertion function
 * @see Patterns - Collection of asymmetric matcher patterns
 *
 * @since 2.0.0
 */

export const xExpect: typeof coreExpect & typeof Patterns = Object.assign(coreExpect, Patterns);
