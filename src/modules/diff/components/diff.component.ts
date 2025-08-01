/**
 * Imports
 */

import { serialize } from '@diff/components/serialize.component';
import { cleanupSemantic } from '@diff/components/semantic.component';
import { diffLinesRaw, diffStringsRaw, DiffTypes } from '@diff/providers/string.provider';
import { CYAN, DIM, EXPECTED, INVERSE, MARK, RECEIVED } from '@components/color.component';

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

        let hasExpected = false;
        let hasReceived = false;
        const expectedLine = [];
        const receivedLine = [];

        let diffs = diffStringsRaw(lineA ?? '', lineB ?? '');
        if(clean) diffs = cleanupSemantic(diffs);

        for (const [ type, text ] of diffs) {
            if (type === DiffTypes.EQUAL) {
                expectedLine.push(text);
                receivedLine.push(text);
            } else if (type === DiffTypes.DELETE) {
                expectedLine.push(INVERSE(text));
                hasExpected = true;
            } else if (type === DiffTypes.INSERT) {
                receivedLine.push(INVERSE(text));
                hasReceived = true;
            }
        }

        if (hasExpected) result.push(EXPECTED(`- ${ expectedLine.join('') }`));
        if (hasReceived) result.push(RECEIVED(`+ ${ receivedLine.join('') }`));
    }

    return result.join('\n');
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

    result.push(EXPECTED('Expected: ') + MARK(aType));
    result.push(RECEIVED('Recevied: ') + MARK(bType));

    if(aType === 'string' && bType === 'string') {
        return diffStrings(<string> a, <string> b, result, clean);
    }

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
