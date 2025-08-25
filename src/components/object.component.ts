/**
 * Import will remove at compile time
 */

import type { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Checks if a given value is an instance of the specified constructor.
 *
 * @param constructor - The constructor function to check against
 * @param value - The value to test
 *
 * @returns True if the value is not null or undefined and its constructor matches the specified constructor; otherwise false
 *
 * @example
 * ```ts
 * class MyClass {}
 * const instance = new MyClass();
 * console.log(isA(MyClass, instance)); // true
 * console.log(isA(Array, instance));   // false
 * ```
 *
 * @since 1.0.0
 */

export function isA(constructor: unknown, value: unknown): boolean {
    return value !== null && value !== undefined && (value.constructor === constructor || typeof value === 'function');
}

/**
 * Checks if the specified key exists as an own property on the given object.
 *
 * @param obj - The object to check for the key
 * @param key - The property key (string or symbol) to look for
 *
 * @returns True if the object has the specified own property key; otherwise false
 *
 * @example
 * ```ts
 * const obj = { foo: 123 };
 * console.log(hasKey(obj, 'foo'));   // true
 * console.log(hasKey(obj, 'bar'));   // false
 * ```
 *
 * @since 1.0.0
 */

export function hasKey(obj: unknown, key: string | symbol): boolean {
    if (obj == null || (typeof obj !== 'object' && typeof obj !== 'function'))
        return false;

    return key in obj || Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Determines whether the given object implements the `AbstractPattern` interface.
 *
 * @param obj - The object to test
 *
 * @returns A type guard indicating whether the object has a `matches` method
 *
 * @remarks
 * This function checks if the object is truthy and has a `matches` method,
 * which is expected for objects implementing `AbstractPattern`.
 *
 * @example
 * ```ts
 * if (isAsymmetric(someObj)) {
 *   someObj.matches(value);
 * }
 * ```
 *
 * @see AbstractPattern - The interface that defines the `matches` method
 *
 * @since 1.0.0
 */

export function isAsymmetric(obj: unknown): obj is AbstractPattern {
    return !!obj && hasKey(obj, 'expectedLabel') && isA(Function, (obj as AbstractPattern).matches);
}

/**
 * Attempts an asymmetric match between two values if either implements `AbstractPattern`.
 *
 * @param a - The first value to test for asymmetric matching
 * @param b - The second value to test for asymmetric matching
 *
 * @returns `true` if `a` matches `b`, `false` if it does not match,
 * `undefined` if neither value implements asymmetric matching or if both do (defer)
 *
 * @remarks
 * This function uses the `isAsymmetric` type guard to detect if either value implements
 * the `AbstractPattern` interface. If both are asymmetric, the comparison is deferred by returning `undefined`.
 * If only one is asymmetric, it performs the match accordingly.
 *
 * @example
 * ```ts
 * const pattern = { matches: (v: any) => v > 10 };
 * console.log(asymmetricMatch(pattern, 15)); // true
 * ```
 *
 * @see isAsymmetric - Helper to detect asymmetric matchers
 * @see AbstractPattern - Interface defining the `matches` method
 *
 * @since 1.0.0
 */

export function asymmetricMatch(a: unknown, b: unknown): boolean | undefined {
    const asymmetricA = isAsymmetric(a);
    const asymmetricB = isAsymmetric(b);

    if (asymmetricA && asymmetricB) {
        return undefined; // Defer comparison; neither dominates
    }

    if (asymmetricA) return a.matches(b);
    if (asymmetricB) return b.matches(a);

    return undefined;
}

/**
 * Performs a deep equality comparison between two objects or arrays.
 *
 * @param a - The first object or array to compare.
 * @param b - The second object or array to compare.
 * @param strictCheck - Whether to require exact shape matching (default: true).
 *                      If false, `b` can be a superset of `a`.
 *
 * @returns A boolean indicating whether the two inputs are deeply equal.
 *
 * @remarks
 * This function is used internally by `equals` to recursively compare arrays and objects.
 *
 * - For arrays:
 *   - If `strictCheck` is true, their lengths must match.
 *   - If false, only the elements of `a` must match the corresponding elements in `b`.
 *
 * - For objects:
 *   - If `strictCheck` is true, both must have exactly the same keys.
 *   - If false, `b` may contain extra keys, but all keys in `a` must match.
 *
 * Keys and values are compared recursively using `equals`, which supports deep matching.
 *
 * @example
 * ```ts
 * deepEquals({ a: 1 }, { a: 1 }, true);         // true
 * deepEquals({ a: 1 }, { a: 1, b: 2 }, false);  // true
 * deepEquals([1, 2], [1, 2, 3], false);         // true
 * deepEquals([1, 2], [2, 1], true);             // false
 * ```
 *
 * @see equals - Performs a general equality comparison (shallow or deep)
 *
 * @since 1.0.0
 */

function deepEquals(a: object, b: object, strictCheck: boolean = true): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
        if(strictCheck && a.length !== b.length) return false;

        return a.every((val, i) => equals(val, b[i], strictCheck));
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (strictCheck && aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!hasKey(b, key)) return false;
        if (!equals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], strictCheck)) {
            return false;
        }
    }

    return true;
}

/**
 * Determines whether two values are equal, supporting both strict and partial deep equality.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @param strictCheck - If true (default), requires exact deep equality.
 *                      If false, allows partial (asymmetric) matching.
 *
 * @returns `true` if the values are considered equal; otherwise, `false`.
 *
 * @remarks
 * This function performs a deep comparison between two values:
 *
 * - Primitives are compared using `Object.is`.
 * - Special objects (Date, RegExp, URL) are compared by value.
 * - Arrays and plain objects are compared recursively via `deepEquals`.
 * - Supports asymmetric matching when `strictCheck` is false (e.g., partial matching).
 *
 * The following helper functions are assumed to exist:
 * - `asymmetricMatch`: handles custom matchers or partial match behavior
 * - `deepEquals`: recursively compares arrays and objects
 *
 * @example
 * ```ts
 * equals(1, 1);                             // true
 * equals(1, '1');                           // false
 * equals({ x: 1 }, { x: 1 });               // true
 * equals({ x: 1 }, { x: 1, y: 2 }, false);  // true (partial match)
 * equals([1, 2], [1, 2, 3], false);         // true (partial match)
 * ```
 *
 * @since 1.0.0
 */

export function equals(a: unknown, b: unknown, strictCheck = true): boolean {
    if (a === b) return true;                   // Fast path for strict equality
    if (Object.is(a, b)) return true;           // Handle identical references or primitive equality
    if (a === null || b === null) return false; // Handle null or undefined cases

    const asymmetricResult = asymmetricMatch(a, b);
    if (asymmetricResult !== undefined) return asymmetricResult;

    if (a instanceof Date && b instanceof Date)

        return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp)
        return a.source === b.source && a.flags === b.flags;

    if (globalThis.URL && a instanceof globalThis.URL && b instanceof globalThis.URL)
        return a.href === b.href;

    if (typeof a === 'object' && typeof b === 'object') {
        return deepEquals(a, b, strictCheck);
    }

    return false;
}
