/**
 * Import will remove at compile time
 */

import type { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * Type guard that checks if a value is an instance of a specific constructor
 *
 * @typeParam T - The type to check against
 * @param constructor - The constructor function to compare against
 * @param value - The value to check
 * @returns A type predicate indicating if value is of type T
 *
 * @example
 * ```ts
 * class Person {}
 * const obj = new Person();
 *
 * if (isA<Person>(Person, obj)) {
 *   // obj is typed as Person here
 * }
 * ```
 *
 * @since 1.0.0
 */

export function isA(constructor: unknown, value: unknown): boolean {
    return value !== null && value !== undefined && value.constructor === constructor;
}

/**
 * Checks if an object has a specific property key
 *
 * @param obj - The object to check
 * @param key - The property key (string or symbol) to look for
 * @returns True if the object has the specified key, false otherwise
 *
 * @example
 * ```ts
 * const user = { id: 1, name: 'John' };
 *
 * if (hasKey(user, 'id')) {
 *   // Safe to access user.id
 * }
 * ```
 *
 * @since 1.0.0
 */

export function hasKey(obj: unknown, key: string | symbol): boolean {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Type guard that checks if an object is an AbstractPattern
 *
 * AsymmetricMatchers are objects with a custom `matches` method used for
 * flexible comparison operations rather than strict equality.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is an AbstractPattern
 *
 * @example
 * ```ts
 * if (isAsymmetric(value)) {
 *   // value is typed as AbstractPattern here
 *   const result = value.matches(otherValue);
 * }
 * ```
 *
 * @since 1.0.0
 */

function isAsymmetric(obj: unknown): obj is AbstractPattern {
    return !!obj && typeof (obj as AbstractPattern).matches === 'function';
}

/**
 * Performs asymmetric matching between two values if either is an AbstractPattern
 *
 * This function checks if either value is an asymmetric matcher, and if so, delegates
 * the comparison to that matcher's `matches` method. If both values are asymmetric matchers,
 * the function defers the comparison by returning undefined.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns
 * - `true` if one value is an asymmetric matcher and it matches the other value
 * - `false` if one value is an asymmetric matcher and it doesn't match the other value
 * - `undefined` if neither value is an asymmetric matcher or if both values are asymmetric matchers
 *
 * @example
 * ```ts
 * // Assuming 'any' is an asymmetric matcher
 * const result = asymmetricMatch(any(Number), 42);
 * // result will be true if 42 satisfies the 'any(Number)' matcher
 * ```
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
 * Performs a deep equality comparison between two values
 *
 * This function performs a recursive deep comparison between two values, handling
 * primitive types, objects, arrays, dates, regular expressions, URLs, and more.
 * It can also handle asymmetric matchers when not in strict mode.
 *
 * @param x - First value to compare
 * @param y - Second value to compare
 * @param strictCheck - When true, disables asymmetric matcher support (default: false)
 * @returns True if the values are deeply equal, false otherwise
 *
 * @example
 * ```ts
 * // Compare primitive values
 * equals(5, 5); // true
 * equals("hello", "world"); // false
 *
 * // Compare objects
 * equals({a: 1, b: 2}, {a: 1, b: 2}); // true
 * equals({a: 1, b: 2}, {b: 2, a: 1}); // true (order doesn't matter)
 *
 * // Compare arrays
 * equals([1, 2, 3], [1, 2, 3]); // true
 * equals([1, 2, 3], [3, 2, 1]); // false (order matters)
 *
 * // Compare with asymmetric matchers
 * equals(any(Number), 42); // true if any(Number) matches 42
 * equals(any(Number), 42, true); // false (strict mode disables matchers)
 * ```
 *
 * @since 1.0.0
 */

export function equals(x: unknown, y: unknown, strictCheck = false): boolean {
    // Fast path for strict equality
    if (x === y) return true;

    // Handle identical references or primitive equality
    if (Object.is(x, y)) return true;

    // Handle null or undefined cases
    if (x === null || y === null) return false;

    // Check for asymmetric matchers if not in strict mode
    if (!strictCheck) {
        const asymmetricResult = asymmetricMatch(x, y);
        if (asymmetricResult !== undefined) return asymmetricResult;
    }

    // Type checks
    if (typeof x !== typeof y) return false;

    // Handle RegExp
    if (x instanceof RegExp && y instanceof RegExp) {
        return x.source === y.source && x.flags === y.flags;
    }

    // Handle Date
    if (x instanceof Date && y instanceof Date) {
        return x.getTime() === y.getTime();
    }

    // Handle URL
    if (x instanceof URL && y instanceof URL) {
        return x.href === y.href;
    }

    // Handle Arrays
    if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length !== y.length) return false;

        return x.every((val, i) => equals(val, y[i], strictCheck));
    }

    // Handle objects (not null, arrays, dates, or regexps which were handled above)
    if (typeof x === 'object' && typeof y === 'object') {
        // Handle different constructors
        if (x.constructor !== y.constructor) {
            return false;
        }

        const xKeys = Object.keys(x as object);
        const yKeys = Object.keys(y as object);
        if (xKeys.length !== yKeys.length) return false;

        // Check each key in x exists in y and values are equal
        for (const key of xKeys) {
            if (!hasKey(y, key)) return false;

            // Cast x and y to records with string keys to fix type error
            const xRecord = x as Record<string, unknown>;
            const yRecord = y as Record<string, unknown>;
            if (!equals(xRecord[key], yRecord[key], strictCheck)) return false;
        }

        return true;
    }

    return false;
}
