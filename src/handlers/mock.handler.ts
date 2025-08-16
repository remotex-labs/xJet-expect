/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { MockStateInterface } from '@matchers/interfaces/mock-matcher.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { diffArgs } from '@diff/components/diff.component';
import { serialize } from '@components/serialize.component';
import { EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Ensures that the received value is an `xJet` mock or spy function.
 *
 * This function is intended to be used within matcher implementations to
 * assert that a value under test is a mock created by the `xJet` mocking system.
 *
 * @param expectedLabels - Optional labels describing the expected value,
 * used in error messages for improved clarity.
 *
 * @throws {@link xJetTypeError}
 * Thrown when the received value is not recognized as an `xJet` mock or spy function.
 *
 * @remarks
 * Validates that the `this.received` object contains both the `xJetMock` flag
 * and a valid `mock` state. If either condition is not met, an `xJetTypeError`
 * is thrown with an appropriate failure message.
 *
 * @since 1.0.0
 */

export function ensureMock(this: MatcherService<MockStateInterface>, expectedLabels: Array<string> = []): void {
    if (!this.received?.xJetMock || !this.received?.mock) {
        throw new xJetTypeError({
            expectedLabels,
            assertionChain: this.assertionChain,
            message: `${ RECEIVED('Received') } value must be a mock or spy function`,
            received: { value: this.received }
        });
    }
}

/**
 * Serializes an array of call arguments into a single formatted string.
 *
 * Each argument is serialized, trimmed of enclosing brackets, and highlighted using {@link EXPECTED}.
 * Commas inside individual arguments are removed to avoid conflicts with the joining commas.
 *
 * @param args - The array of arguments to serialize.
 * @returns A string with all arguments serialized and comma-separated.
 *
 * @remarks
 * - Removes any commas inside individual arguments to prevent confusion when joining.
 * - Uses {@link EXPECTED} to colorize each argument consistently.
 *
 * @example
 * ```ts
 * const args = [1, "test", true];
 * console.log(serializeCallArgs(args));
 * // Output (with ANSI colors):
 * // 1, test, true
 * ```
 *
 * @example
 * ```ts
 * // Arguments containing commas
 * const args = ["a,b", "c"];
 * console.log(serializeCallArgs(args));
 * // Output:
 * // a b, c
 * ```
 *
 * @since 1.0.0
 */

export function serializeCallArgs(args: Array<unknown>): string {
    const serialized = serialize(args, '').slice(1, -1);

    return serialized.map((arg) => {
        return EXPECTED(arg.replace(',', ''));
    }).join(', ');
}

/**
 * Serializes a list of calls or values into a formatted, optionally highlighted string.
 *
 * Each line contains an index, optional highlight symbol, and a diff of the call/value against the expected value.
 *
 * @param expected - The expected value to diff against each item.
 * @param items - The array of calls or values to serialize.
 * @param offset - Optional 1-based index to highlight.
 * @param symbol - Symbol to use for highlighting the selected line. Default is `'->'`.
 * @param sliceArgs - Whether to slice the diff result to remove outer brackets. Default is `false`.
 * @param maxLines - Maximum number of lines to include. Default is `3`.
 * @returns A formatted string representing the serialized list, or an empty string if `items` is empty.
 *
 * @example
 * ```ts
 * const expected = [1, 2];
 * const calls = [[1, 3], [1, 2], [2, 2]];
 * console.log(serializeList(expected, calls));
 * // Output (with ANSI colors):
 * //    1: 1 \x1B[31m3\x1B[39m
 * //    2: 1 2
 * //    3: \x1B[31m2\x1B[39m 2
 * ```
 *
 * @since 1.0.0
 */

export function serializeList(
    expected: unknown, items: Array<unknown>, offset?: number, symbol: string = '->', sliceArgs: boolean = false, maxLines: number = 3
): string {
    if (!items?.length) return '';


    let start = 0;
    let highlightIndex = -1;
    const total = items.length;

    if (offset && offset >= 1 && offset <= total) {
        highlightIndex = offset - 1;
        start = Math.max(0, Math.min(highlightIndex - 1, total - (maxLines - 1)));
    }

    const end = Math.min(start + maxLines, total);
    const width = String(end).length;
    const symbolPad = ' '.repeat(symbol.length + 1);
    const result: Array<string> = new Array(end - start);

    for (let i = start; i < end; i++) {
        const args = items[i];
        const num = String(i + 1).padStart(width, ' ');
        const prefix = i === highlightIndex ? `${ symbol } ` : symbolPad;

        if(sliceArgs && Array.isArray(args) && args.length < 1) {
            result[i - start] = `${ prefix }${ num }: called with 0 arguments`;
            continue;
        }

        const diff = sliceArgs
            ? diffArgs(expected, args).slice(1, -1)
            : diffArgs(expected, args);

        result[i - start] = `${ prefix }${ num }: ${ diff.join(' ') }`;
    }

    return result.join('\n');
}


/**
 * Serializes a list of highlighted calls with diffs against the expected values.
 *
 * Only the calls at the specified `highlights` indices are included, up to `maxLines`.
 *
 * @param expected - The expected argument array.
 * @param calls - Array of actual calls to diff against `expected`.
 * @param highlights - 1-based indices of calls to include in the output.
 * @param maxLines - Maximum number of lines to include. Default is `3`.
 * @returns A formatted string of the highlighted calls, or an empty string if no calls or highlights.
 *
 * @example
 * ```ts
 * const expected = [1, 2];
 * const calls = [[1, 3], [1, 2], [2, 2]];
 * console.log(serializeHighlightedCalls(expected, calls, [1, 3]));
 * // Output:
 * //   1: 1 \x1B[31m3\x1B[39m
 * //   3: \x1B[31m2\x1B[39m 2
 * ```
 *
 * @since 1.0.0
 */

export function serializeHighlightedCalls(expected: Array<unknown>, calls: Array<unknown[]>, highlights: Array<number> = [], maxLines: number = 3): string {
    if (!calls?.length || !highlights.length) return '';

    const total = calls.length;
    const width = String(total).length + 3;

    const results: Array<string> = [];
    for (let i = 0; i < highlights.length; i++) {
        const idx = highlights[i] - 1; // convert 1-based to 0-based
        if (idx < 0 || idx >= total) continue;

        const diff = diffArgs(expected, calls[idx]).slice(1, -1);

        results.push(`${ String(idx + 1).padStart(width, ' ') }: ${ diff.join(' ') }`);
        if(results.length >= maxLines) break;
    }

    return results.join('\n');
}

/**
 * Serializes a list of calls with diffs, slicing the arguments for concise output.
 *
 * @param expected - The expected argument array.
 * @param returns - Array of actual calls to diff against `expected`.
 * @param offset - Optional 1-based index to highlight.
 * @param symbol - Symbol to highlight the selected line.
 * @returns A formatted string representing the serialized calls.
 *
 * @see serializeList
 * @since 1.0.0
 */

export function serializeCallList(expected: Array<unknown>, returns: Array<unknown[]>, offset?: number, symbol?: string): string {
    return serializeList(expected, returns, offset, symbol, true);
}

/**
 * Serializes a list of return values with diffs against the expected value.
 *
 * @param expected - The expected value.
 * @param calls - Array of return values to diff against `expected`.
 * @param offset - Optional 1-based index to highlight.
 * @param symbol - Symbol to highlight the selected line.
 * @returns A formatted string representing the serialized return values.
 *
 * @see serializeList
 * @since 1.0.0
 */

export function serializeReturnList(expected: unknown, calls: Array<unknown>, offset?: number, symbol?: string): string {
    return serializeList(expected, calls, offset, symbol, false);
}

