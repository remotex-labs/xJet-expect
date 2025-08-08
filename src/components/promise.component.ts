/**
 * Determines whether the given candidate is a Promise-like object.
 *
 * @template T - The type of the resolved value of the Promise
 *
 * @param candidate - The value to test for Promise-like behavior
 *
 * @returns A type guard indicating whether the candidate is a Promise-like object
 *
 * @remarks
 * This function checks if the candidate is non-null and either an object or a function,
 * then verifies the presence of a `then` method to identify Promise-like objects.
 *
 * @example
 * ```ts
 * if (isPromise(someValue)) {
 *   someValue.then(value => {
 *     console.log('Resolved with', value);
 *   });
 * }
 * ```
 *
 * @since 1.0.0
 */

export function isPromise<T = unknown>(candidate: unknown): candidate is PromiseLike<T> {
    return (
        candidate != null &&
        (typeof candidate === 'object' || typeof candidate === 'function') &&
        typeof (candidate as Promise<unknown>).then === 'function'
    );
}
