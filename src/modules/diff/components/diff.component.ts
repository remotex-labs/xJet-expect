/**
 * Imports
 */

import { serialize } from '@components/serialize.component';
import { cleanupSemantic } from '@diff/components/semantic.component';
import { asymmetricMatch, isAsymmetric } from '@components/object.component';
import { CYAN, DIM, EXPECTED, INVERSE, RECEIVED } from '@components/color.component';
import { diffLinesRaw, diffStringsRaw, DiffTypes } from '@diff/providers/string.provider';

/**
 * Determines the type of any JavaScript value as a string representation.
 *
 * @param value - The value whose type should be determined
 * @returns A string representing the type of the value
 *
 * @remarks
 * This function provides a more detailed type description than JavaScript's built-in
 * `typeof` operator by also identifying specific object types through their constructor
 * names. The function handles special cases:
 *
 * - For `null`, it returns the string "null" (unlike `typeof` which returns "object")
 * - For primitive types (string, number, boolean, undefined), it returns the standard typeof result
 * - For objects, it returns the constructor name when available (e.g., "Array", "Map", "Set", "Date")
 * - For objects with missing or invalid constructor information, it falls back to "Object"
 *
 * This makes the function particularly useful for debugging, error messages, and
 * test frameworks where precise type identification helps diagnose issues.
 *
 * @example
 * ```ts
 * getType(null);                // "null"
 * getType(undefined);           // "undefined"
 * getType(42);                  // "number"
 * getType("hello");             // "string"
 * getType(true);                // "boolean"
 * getType([1, 2, 3]);           // "Array"
 * getType(new Map());           // "Map"
 * getType(new Date());          // "Date"
 * getType({});                  // "Object"
 * getType(Object.create(null)); // "Object" (no constructor)
 * ```
 *
 * @since 1.0.0
 */

export function getType(value: unknown): string {
    if (value === null) return 'null';
    if (value === true) return 'true';
    if (value === false) return 'false';

    return value && typeof value === 'object' ? value.constructor?.name ?? 'Object' : typeof value;
}

/**
 * Normalizes two strings by computing a semantic diff and marking differences with inverse formatting.
 *
 * This function uses a raw diff algorithm followed by semantic cleanup to align matching parts,
 * then inverts added or removed segments to visually highlight differences.
 *
 * @param a - The first string to normalize.
 * @param b - The second string to normalize.
 * @param clean - Whether to apply semantic cleanup to diffs for improved readability
 * @returns A tuple of strings with aligned and marked differences.
 *
 * @remarks
 * - The result uses `INVERSE` formatting for added or removed segments.
 * - Matching segments are preserved as-is.
 * - Empty strings are replaced with a tab (`\t`) to ensure diffing is stable.
 *
 * @example
 * ```ts
 * const [a, b] = normalizeStrings("hello", "hallo");
 * // a: "h\u001b[7me\u001b[27mllo"
 * // b: "h\u001b[7ma\u001b[27mllo"
 * ```
 *
 * @since 1.0.0
 */

export function normalizeStrings(a: string, b: string, clean: boolean = true): [ string, string ] {
    let resultA = '';
    let resultB = '';
    let diffs = diffStringsRaw(a || '\t', b || '\t');
    if(clean) diffs = cleanupSemantic(diffs);

    for (const [ type, text ] of diffs) {
        if (type === DiffTypes.EQUAL) {
            resultA += text;
            resultB += text;
        } else if (type === DiffTypes.DELETE) {
            resultA += INVERSE(text);
        } else if (type === DiffTypes.INSERT) {
            resultB += INVERSE(text);
        }
    }

    return [ resultA, resultB ];
}

/**
 * Recursively normalizes two arrays by aligning each element.
 *
 * The function mutates both input arrays in-place, recursively normalizing
 * each pair of elements by index. If arrays differ in length, undefined
 * elements will be normalized as well.
 *
 * @param a - The first array to normalize.
 * @param b - The second array to normalize.
 * @returns A tuple containing the normalized arrays.
 *
 * @remarks
 * - Elements are normalized using {@link normalizeAsymmetric}.
 * - The result is the same reference as the original arrays, modified in-place.
 * - The resulting arrays will have the same length, equal to the longer of the two.
 *
 * @example
 * ```ts
 * const [a, b] = normalizeArrays([1, 2], [1, expect.any(Number)]);
 * // a: [1, 2]
 * // b: [1, 2]
 * ```
 *
 * @since 1.0.0
 */

export function normalizeArrays(a: unknown[], b: unknown[]): [ unknown[], unknown[] ] {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        [ a[i], b[i] ] = normalizeAsymmetric(a[i], b[i]);
    }

    return [ a, b ];
}

/**
 * Recursively normalizes two objects by aligning values at shared keys.
 *
 * The function mutates both input objects in-place, normalizing values
 * only for keys that exist in both objects. Missing keys are ignored.
 *
 * @param a - The first object to normalize.
 * @param b - The second object to normalize.
 * @returns A tuple containing the normalized objects.
 *
 * @remarks
 * - Values are normalized using {@link normalizeAsymmetric}.
 * - Only keys present in both `a` and `b` are processed.
 * - Keys present in one object but not the other are left untouched.
 * - The function operates recursively on nested objects.
 *
 * @example
 * ```ts
 * const objA = { foo: expect.any(String), bar: 42 };
 * const objB = { foo: "hello", bar: 42 };
 *
 * const [a, b] = normalizeObjects(objA, objB);
 * // a: { foo: "hello", bar: 42 }
 * // b: { foo: "hello", bar: 42 }
 * ```
 *
 * @since 1.0.0
 */

export function normalizeObjects(a: Record<string, unknown>, b: Record<string, unknown>): [ Record<string, unknown>, Record<string, unknown> ] {
    const keys = new Set([ ...Object.keys(a), ...Object.keys(b) ]);
    for (const key of keys) {
        if (key in a && key in b) {
            [ a[key], b[key] ] = normalizeAsymmetric(a[key], b[key]);
        }
    }

    return [ a, b ];
}

/**
 * Creates a colored, human-readable unified diff between two strings.
 *
 * @param a - The first string (original content) to compare
 * @param b - The second string (modified content) to compare
 * @param clean - Whether to apply semantic cleanup to diffs for improved readability
 * @returns A formatted string containing the unified diff representation
 *
 * @remarks
 * This function generates a git-style unified diff output with syntax highlighting
 * for easy readability. It processes the input strings as follows:
 *
 * 1. Splits both strings into lines
 * 2. Adds a unified diff header showing line counts
 * 3. For each line pair:
 *    - Unchanged lines are shown dimmed with a leading space
 *    - Changed lines are analyzed character by character
 *    - Removed content is highlighted in green with a leading "-"
 *    - Added content is highlighted in red with a leading "+"
 *    - Changed portions within lines are additionally inverted for emphasis
 *
 * The result array is populated with formatted lines and then joined with newlines
 * to create the final string output.
 *
 * @example
 * ```ts
 * const original = "line one\nline two\nline three";
 * const modified = "line one\nmodified line\nline three";
 * const result = [];
 *
 * const diffOutput = diffStrings(original, modified, result);
 * console.log(diffOutput);
 * // Output will be a colored diff showing:
 * // @@ -1,3 +1,3 @@
 * //   line one
 * // - line two
 * // + modified line
 * //   line three
 * ```
 *
 * @see diffStringsRaw - The underlying function that generates the raw diff data
 * @see DiffTypes - Enum defining the types of diff operations
 *
 * @since 1.0.0
 */

export function normalizeAsymmetric(a: unknown, b: unknown, clean: boolean = true): [ unknown, unknown ] {
    if (a === b) return [ a, b ];

    const aType = typeof a;
    const bType = typeof b;
    const match = asymmetricMatch(a, b);
    if (match === true) {
        if (isAsymmetric(a)) return [ b, b ];
        if (isAsymmetric(b)) return [ a, a ];
    }

    if (aType === 'string' && bType === 'string') return normalizeStrings(<string> a, <string> b, clean);
    if (!a || !b || aType !== 'object' || bType !== 'object') {
        return [ a, b ];
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        return normalizeArrays(a, b);
    }

    return normalizeObjects(a as Record<string, unknown>, b as Record<string, unknown>);
}

/**
 * Creates a colored, human-readable unified diff between two strings.
 *
 * @param a - The first string (original content) to compare
 * @param b - The second string (modified content) to compare
 * @param result - Array that will be populated with formatted diff output lines
 * @param clean - Whether to apply semantic cleanup to diffs for improved readability
 * @returns A formatted string containing the unified diff representation
 *
 * @remarks
 * This function generates a git-style unified diff output with syntax highlighting
 * for easy readability. It processes the input strings as follows:
 *
 * 1. Splits both strings into lines
 * 2. Adds a unified diff header showing line counts
 * 3. For each line pair:
 *    - Unchanged lines are shown dimmed with a leading space
 *    - Changed lines are analyzed character by character
 *    - Removed content is highlighted in green with a leading "-"
 *    - Added content is highlighted in red with a leading "+"
 *    - Changed portions within lines are additionally inverted for emphasis
 *
 * The result array is populated with formatted lines and then joined with newlines
 * to create the final string output.
 *
 * @example
 * ```ts
 * const original = "line one\nline two\nline three";
 * const modified = "line one\nmodified line\nline three";
 * const result = [];
 *
 * const diffOutput = diffStrings(original, modified, result);
 * console.log(diffOutput);
 * // Output will be a colored diff showing:
 * // @@ -1,3 +1,3 @@
 * //   line one
 * // - line two
 * // + modified line
 * //   line three
 * ```
 *
 * @see diffStringsRaw - The underlying function that generates the raw diff data
 * @see DiffTypes - Enum defining the types of diff operations
 *
 * @since 1.0.0
 */

export function diffStrings(a: string, b: string, result: Array<string>, clean: boolean = true): string {
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    result.push(CYAN(`\n@@ -1,${ aLines.length } +1,${ bLines.length } @@\n`));

    const max = Math.max(aLines.length, bLines.length);
    for (let i = 0; i < max; i++) {
        const lineA = aLines[i];
        const lineB = bLines[i];

        if (lineA === lineB) {
            if (lineA) result.push(DIM(`  ${ lineA }`));
            continue;
        }

        const expectedLine = [];
        const receivedLine = [];

        if (lineA !== undefined && lineB !== undefined) {
            let diffs = diffStringsRaw(lineA || '\t', lineB || '\t');
            if (clean) diffs = cleanupSemantic(diffs);

            for (const [ type, text ] of diffs) {
                if (type === DiffTypes.EQUAL) {
                    expectedLine.push(text);
                    receivedLine.push(text);
                } else if (type === DiffTypes.DELETE) {
                    expectedLine.push(INVERSE(text));
                } else if (type === DiffTypes.INSERT) {
                    receivedLine.push(INVERSE(text));
                }
            }
        }

        if (lineA === undefined) receivedLine.push(lineB);
        if (!lineB === undefined) expectedLine.push(lineA);

        if (expectedLine.length > 0) result.push(EXPECTED(`- ${ expectedLine.join('') }`));
        if (receivedLine.length > 0) result.push(RECEIVED(`+ ${ receivedLine.join('') }`));
    }

    return result.join('\n');
}

/**
 * Produces a colorized diff between two argument lists, handling asymmetric values and trailing commas.
 *
 * @param a - The expected value or argument list.
 * @param b - The received value or argument list.
 * @returns An array of strings representing the colorized diff, with:
 * - Equal values dimmed using {@link DIM}.
 * - Inserted (extra) values highlighted using {@link RECEIVED}.
 * - Trailing commas preserved and appended after diff highlighting.
 *
 * @remarks
 * - Both `a` and `b` are normalized using {@link normalizeAsymmetric} to support asymmetric matchers.
 * - Values are serialized via {@link serialize}.
 * - Uses {@link diffLinesRaw} to compute differences.
 * - This function ensures that commas at the end of values are preserved but not highlighted.
 *
 * @example
 * ```ts
 * const expected = [1, 2];
 * const received = [1, 3];
 *
 * console.log(diffArgs(expected, received));
 * // Output (with ANSI colors):
 * // [
 * //   '\x1B[2m1\x1B[22m,',
 * //   '\x1B[31m3\x1B[39m'
 * // ]
 * ```
 *
 * @example
 * ```ts
 * // Works with trailing commas
 * const expected = [4, "x"];
 * const received = [4, "y"];
 *
 * console.log(diffArgs(expected, received));
 * // [
 * //   '\x1B[2m4\x1B[22m,',
 * //   '\x1B[31m"y"\x1B[39m'
 * // ]
 * ```
 *
 * @since 1.0.0
 */

export function diffArgs(a: unknown, b: unknown): Array<string> {
    const result: Array<string> = [];

    [ a, b ] = normalizeAsymmetric(a, b, true);
    const aLines = serialize(a, '');
    const bLines = serialize(b, '');

    const diffs = diffLinesRaw(aLines, bLines);
    for (const [ type, line ] of diffs) {
        let value = line;
        let comma = '';

        if (value.endsWith(',')) {
            value = value.slice(0, -1);
            comma = ',';
        }

        if (type === DiffTypes.EQUAL) result.push(DIM(value) + comma);
        else if (type === DiffTypes.INSERT) result.push(RECEIVED(value) + comma);
    }

    return result;
}

/**
 * Creates a formatted, colored diff representation between any two JavaScript values.
 *
 * @param a - The expected value to compare
 * @param b - The received value to compare
 * @param clean - Whether to apply semantic cleanup to diffs for improved readability
 * @returns A formatted string containing the diff representation with colored highlighting
 *
 * @remarks
 * This versatile diff function can compare any JavaScript values, intelligently handling
 * different types of data:
 *
 * 1. It first identifies and displays the types of both values
 * 2. For string values, it generates a character-level diff with highlighted changes
 * 3. For all other values, it serializes them into string representations and creates a line-by-line diff
 *
 * The output is formatted similar to git's unified diff format with:
 * - A header showing expected and received types
 * - A unified diff header (`@@ -1,n +1,m @@`) showing line counts
 * - Line prefixes that indicate unchanged lines (dimmed with two spaces)
 * - Line prefixes that indicate removed lines (green with a "-" prefix)
 * - Line prefixes that indicate added lines (red with a "+" prefix)
 *
 * This function is particularly useful for test frameworks to visualize the differences
 * between expected and actual values in assertion failures.
 *
 * @example
 * ```ts
 * // Comparing two objects
 * const expected = { name: "test", value: 123 };
 * const received = { name: "test", value: 456 };
 *
 * console.log(diffComponent(expected, received));
 * // Output will include:
 * // Expected: Object
 * // Received: Object
 * // @@ -1,4 +1,4 @@
 * //   Object {
 * //     name: "test",
 * // -   value: 123
 * // +   value: 456
 * //   }
 * ```
 *
 * @see diffStrings - Function used for string-to-string comparison
 * @see diffLinesRaw - Function used for line-by-line comparison of serialized values
 * @see getType - Function used to determine the types of input values
 * @see serialize - Function used to convert values to string representations
 *
 * @since 1.0.0
 */

export function diffComponent(a: unknown, b: unknown, clean: boolean = true): string {
    const aType = getType(a);
    const bType = getType(b);
    const result: Array<string> = [];

    if (aType !== bType) {
        result.push('Expected type: ' + EXPECTED(aType));
        result.push('Received type: ' + RECEIVED(bType));
    }

    if (aType === 'string' && bType === 'string') {
        return diffStrings(<string>a, <string>b, result, clean);
    }

    [ a, b ] = normalizeAsymmetric(a, b, clean);
    const aLines = serialize(a);
    const bLines = serialize(b);
    result.push(CYAN(`\n@@ -1,${ aLines.length } +1,${ bLines.length } @@\n`));

    const diffs = diffLinesRaw(aLines, bLines);
    for (const [ type, line ] of diffs) {
        if (type === DiffTypes.EQUAL) result.push(DIM(`  ${ line }`));
        else if (type === DiffTypes.DELETE) result.push(EXPECTED(`- ${ line }`));
        else if (type === DiffTypes.INSERT) result.push(RECEIVED(`+ ${ line }`));
    }

    return result.join('\n');
}
