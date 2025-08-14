/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { diffComponent, getType } from '@diff/components/diff.component';
import { ensureType, handleFailure, serializeOneLine } from '@handlers/matchers.handler';

/**
 * Asserts that a received string has the specified length.
 *
 * @param length - The expected length of the string.
 *
 * @remarks
 * - Works with both `number` and `bigint` for the expected length.
 * - Throws an `xJetTypeError` if the received value does not have a numeric `length` property.
 *
 * @example
 * ```ts
 * expect("abc").toHaveLength(3); // Passes
 * expect("abc").toHaveLength(5); // Fails
 * expect("abc").not.toHaveLength(2); // Passes
 * ```
 *
 * @since 1.0.0
 */

export function toHaveLength(this: MatcherService<string>, length: number | bigint): void {
    const expectedLabels = [ 'length' ];
    ensureType.call(this, length, [ 'number', 'bigint' ], 'Expected', expectedLabels);

    if(!Object.hasOwn(<object> <unknown> this.received, 'length') || !Number.isSafeInteger(this.received.length)) {
        throw new xJetTypeError({
            expectedLabels,
            message: `${ RECEIVED('received') } value must have a length property whose value must be a number`,
            received: { value: this.received, type: getType(this.received) },
            assertionChain: this.assertionChain
        });
    }

    const received = this.received;
    const pass = received.length == length;

    handleFailure.call(this, {
        pass,
        expectedLabels,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected length: not ${ EXPECTED(serializeOneLine(length)) }`);
            info.push(`Received string:     ${ RECEIVED(serializeOneLine(received)) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected length: ${ EXPECTED(serializeOneLine(length)) }`);
            info.push(`Received length: ${ RECEIVED(serializeOneLine(received.length)) }`);
            info.push(`Received string: ${ RECEIVED(serializeOneLine(received)) }`);
        }
    });
}

/**
 * Asserts that a received string matches a given substring or regular expression.
 *
 * @param expected - A string to search for, or a `RegExp` pattern to match against.
 *
 * @remarks
 * - Accepts both `string` and `RegExp` as the expected value.
 * - For `string` matching, it checks if the substring exists within the received value.
 * - For `RegExp` matching, it uses `RegExp.test()` to verify the pattern.
 *
 * @example
 * ```ts
 * expect("Hello World").toMatch("World"); // Passes
 * expect("Hello World").toMatch(/world/i); // Passes (case-insensitive)
 * expect("Hello World").not.toMatch("Earth"); // Passes
 * ```
 *
 * @since 1.0.0
 */

export function toMatch(this: MatcherService<string>, expected: RegExp | string): void {
    const expectedLabels = [ 'expected' ];
    ensureType.call(this, this.received, [ 'string' ], 'Received', expectedLabels);
    ensureType.call(this, expected, [ 'string', 'RegExp' ], 'Expected', expectedLabels);

    const received = this.received;
    const pass = typeof expected === 'string'
        ? received.includes(expected)
        : new RegExp(expected).test(received);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ EXPECTED(serializeOneLine(received)) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            if(expected instanceof RegExp) {
                info.push(`Expected pattern: ${ EXPECTED(serializeOneLine(expected)) }`);
                info.push(`Received string:  ${ RECEIVED(serializeOneLine(received)) }`);
            } else {
                info.push(diffComponent(expected, received, true));
            }
        }
    });
}
