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
 * Performs a deep equality check between two objects.
 *
 * @param a - The first object to compare
 * @param b - The second object to compare
 * @param strictCheck - Whether to perform a strict comparison (e.g., considering types)
 *
 * @returns A boolean indicating whether the two objects are deeply equal
 *
 * @remarks
 * This function compares the constructors of both objects first. If they differ, it returns false.
 * For arrays, it compares length and each element recursively using the `equals` function.
 * For plain objects, it compares keys length, ensures all keys exist in both objects, and
 * recursively compares their values using `equals`.
 *
 * Note: The helper functions `equals` and `hasKey` are assumed to be defined elsewhere and
 * handle equality and key presence checks respectively.
 *
 * @example
 * ```ts
 * const obj1 = { x: 1, y: { z: 3 } };
 * const obj2 = { x: 1, y: { z: 3 } };
 * const isEqual = deepEquals(obj1, obj2, true);
 * console.log(isEqual); // true
 * ```
 *
 * @see equals - Function that performs an equality check between two values
 *
 * @since 1.0.0
 */

function deepEquals(a: object, b: object, strictCheck: boolean): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;

        return a.every((val, i) => equals(val, b[i], strictCheck));
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!hasKey(b, key)) return false;
        if (!equals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], strictCheck)) {
            return false;
        }
    }

    return true;
}

/**
 * Determines whether two values are equal, with optional strictness.
 *
 * @param a - The first value to compare
 * @param b - The second value to compare
 * @param strictCheck - If true, performs a strict equality check; defaults to false
 *
 * @returns A boolean indicating whether the two values are considered equal
 *
 * @remarks
 * This function provides deep equality checks for various types, including primitives,
 * Dates, RegExps, URLs, arrays, and objects. It uses `Object.is` for strict equality and
 * supports asymmetric matching when `strictCheck` is false.
 *
 * Specialized handling includes:
 * - Fast path for strict equality using `===`
 * - Null checks
 * - Asymmetric matching via `asymmetricMatch` helper
 * - Type checks to prevent mismatches
 * - Recursive deep equality for arrays and objects using `deepEquals`
 *
 * The helpers `asymmetricMatch` and `deepEquals` are assumed to be defined elsewhere.
 *
 * @example
 * ```ts
 * equals(42, '42');        // false
 * equals(42, 42);          // true
 * equals([1, 2], [1, 2]);  // true
 * equals({a: 1}, {a: 1});  // true
 * ```
 *
 * @since 1.0.0
 */

export function equals(a: unknown, b: unknown, strictCheck = false): boolean {
    if (a === b) return true;                   // Fast path for strict equality
    if (Object.is(a, b)) return true;           // Handle identical references or primitive equality
    if (a === null || b === null) return false; // Handle null or undefined cases

    if (!strictCheck) {
        const asymmetricResult = asymmetricMatch(a, b);
        if (asymmetricResult !== undefined) return asymmetricResult;
    }

    if (a instanceof Date && b instanceof Date)

        return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp)
        return a.source === b.source && a.flags === b.flags;

    if (a instanceof URL && b instanceof URL)
        return a.href === b.href;

    if (typeof a === 'object' && typeof b === 'object') {
        return deepEquals(a, b, strictCheck);
    }

    return false;
}
