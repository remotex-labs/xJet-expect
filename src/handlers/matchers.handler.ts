/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { AssertionResultInterface } from '@errors/interfaces/expect-error.interface';
import type { HandleDiffFailureInterface, HandleFailureInterface } from './interfaces/matchers-handler.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { xJetExpectError } from '@errors/expect.error';
import { diffComponent, getType } from '@diff/diff.module';
import { serialize } from '@components/serialize.component';
import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Ensures that a given value matches one of the specified types.
 *
 * Throws an ` xJetTypeError ` if the value's type does not match any of the allowed types.
 *
 * @param value - The value to check.
 * @param types - An array of allowed type names as strings.
 * @param label - Specifies whether the value is 'Expected' or 'Received' (used in an error message).
 * @param expectedLabels - Array of expected argument labels
 *
 * @throws xJetTypeError - When the value's type is not included in `types`.
 *
 * @example
 * ```ts
 * // Inside a MatcherService context
 * this.ensureType(42, ['number', 'bigint'], 'Received'); // Passes
 * this.ensureType('hello', ['number'], 'Expected'); // Throws xJetTypeError
 * ```
 *
 * @since 1.0.0
 */

export function ensureType(this: MatcherService, value: unknown, types: Array<string>, label: string, expectedLabels: Array<string> = []): void {
    const type = getType(value);
    if (!types.includes(type) && !types.includes(typeof value)) {
        throw new xJetTypeError({
            expectedLabels,
            assertionChain: this.assertionChain,
            message: `${ (label === 'Received' ? RECEIVED : EXPECTED)(label) } value must be a ${ types.join(' or ') }`,
            [label === 'Expected' ? 'expected' : 'received']: { value, type }
        });
    }
}

/**
 * Ensures that a given value is neither `null` nor `undefined`.
 *
 * Throws an ` xJetTypeError ` if the value is `null` or `undefined`.
 *
 * @param value - The value to check.
 * @param label - Specifies whether the value is 'Expected' or 'Received' (used in an error message).
 * @param expectedLabels - Array of expected argument labels
 *
 * @throws xJetTypeError - When the value is `null` or `undefined`.
 *
 * @example
 * ```ts
 * // Inside a MatcherService context
 * this.ensureNotNullish(0, 'Received'); // Passes
 * this.ensureNotNullish(null, 'Expected'); // Throws xJetTypeError
 * this.ensureNotNullish(undefined, 'Received'); // Throws xJetTypeError
 * ```
 *
 * @since 1.0.0
 */

export function ensureNotNullish(this: MatcherService, value: unknown, label: 'Expected' | 'Received', expectedLabels: Array<string> = []): void {
    if (value === null || value === undefined) {
        throw new xJetTypeError({
            expectedLabels,
            assertionChain: this.assertionChain,
            message: `${ (label === 'Received' ? RECEIVED : EXPECTED)(label) } value must not be null nor undefined`,
            [label === 'Expected' ? 'expected' : 'received']: { value }
        });
    }
}

/**
 * Serializes a value into a single-line human-readable string representation.
 *
 * @param value - The value to serialize.
 * @returns A single-line string representation of the serialized value.
 *
 * @example
 * ```ts
 * serializeOneLine({ a: 1, b: [2, 3] });
 * // Returns: "Object { a: 1, b: Array [ 2, 3 ] }"
 * ```
 *
 * @since 1.0.0
 */

export function serializeOneLine(value: unknown): string {
    return serialize(value, '').join(' ');
}

/**
 * Handles matcher failures by evaluating pass/fail status and throwing an error if needed.
 *
 * @param options - Configuration options describing the failure details.
 *
 * @remarks
 * Determines whether to throw an error based on the pass status and the current "not" modifier.
 * Calls optional handlers `handleNot` or `handleInfo` to populate additional info messages.
 * Throws a formatted xJetExpectError with composed assertion details and info.
 *
 * The function is intended to be called with `this` bound to an instance of `MatcherService`.
 *
 * @throws xJetExpectError - When the assertion fails, according to the logic.
 *
 * @since 1.0.0
 */

export function handleFailure(this: MatcherService, options: HandleFailureInterface): void {
    const { pass } = options;
    const shouldThrow = (pass && this.notModifier) || (!pass && !this.notModifier);
    if (!shouldThrow) return;

    const info: Array<string> = [];
    const assertion: AssertionResultInterface = {
        pass,
        name: this.macherName,
        received: this.received,
        expected: options.expected
    };

    if (this.notModifier) {
        options.handleNot?.call(this, info);
    } else {
        options.handleInfo?.call(this, info);
    }

    throw new xJetExpectError({
        info,
        assertion,
        ...options,
        assertionChain: this.assertionChain
    });
}

/**
 * Handles matcher failures involving detailed diff information.
 *
 * @param options - Configuration options describing the failure with diff details.
 *
 * @remarks
 * Calls `handleFailure` with custom `handleNot` and `handleInfo` handlers:
 * - `handleNot` adds an inverted expectation message.
 * - `handleInfo` adds a note (if present) and a formatted diff between expected and received values.
 *
 * The function is intended to be called with `this` bound to an instance of `MatcherService`.
 *
 * @since 1.0.0
 */

export function handleDiffFailure(this: MatcherService, options: HandleDiffFailureInterface): void {
    handleFailure.call(this, {
        ...options,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ EXPECTED(serializeOneLine(this.received)) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>) {
            if (options.note) info.push(DIM(options.note), '');
            info.push(diffComponent(options.expected, this.received, true));
        }
    });
}

/**
 * Handles matcher failures involving simple comparisons with an operator.
 *
 * @param options - Configuration options describing the failure.
 * @param operator - The operator string used in the comparison (e.g., '===', '!==').
 *
 * @remarks
 * Calls `handleFailure` with custom `handleNot` and `handleInfo` handlers that
 * format expected and received values with the given operator, including alignment.
 *
 * The function is intended to be called with `this` bound to an instance of `MatcherService`.
 *
 * @since 1.0.0
 */

export function handleComparisonFailure(this: MatcherService, options: HandleFailureInterface, operator: string): void {
    const space = ' '.repeat(operator.length);

    handleFailure.call(this, {
        ...options,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ operator } ${ EXPECTED(serializeOneLine(options.expected)) }`);
            info.push(`Received:     ${ space } ${ RECEIVED(serializeOneLine(this.received)) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ operator } ${ EXPECTED(serializeOneLine(options.expected)) }`);
            info.push(`Received: ${ space } ${ RECEIVED(serializeOneLine(this.received)) }`);
        }
    });
}
