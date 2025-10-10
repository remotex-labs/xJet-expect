/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { AbstractPattern } from '@patterns/abstract.pattern';
import type { ConstructorLikeType } from '@interfaces/functions.interface';
import type { ThrownType, ThrownValueType } from '@matchers/interfaces/functions-matcher.interface';
import type { HandleInfoType, HandleNotType } from '@handlers/interfaces/matchers-handler.interface';

/**
 * Imports
 */

import { diffComponent } from '@diff/components/diff.component';
import { serializeError } from '@components/serialize.component';
import { equals, isAsymmetric } from '@components/object.component';
import { EXPECTED, INVERSE, RECEIVED } from '@components/color.component';
import { ensureType, handleFailure, serializeOneLine } from '@handlers/matchers.handler';

/**
 * Converts any thrown value into a {@link ThrownType}, normalizing Errors and non-Error values.
 *
 * @param err - The value that was thrown.
 *
 * @returns A {@link ThrownType} containing the value, type information, and message.
 *
 * @remarks
 * Ensures consistent handling of thrown values in matcher assertions.
 * Distinguishes between actual Error instances and arbitrary thrown objects/values.
 *
 * @example
 * ```ts
 * const thrown = getThrown(new Error('Oops'));
 * console.log(thrown.message); // "Oops"
 * console.log(thrown.isError); // true
 * ```
 *
 * @see ThrownType
 *
 * @since 1.0.0
 */

export function getThrown(err: unknown): ThrownType {
    const e = err as Record<string, unknown>;
    const hasMessage = e != null && typeof e.message === 'string';
    const isError = hasMessage && typeof e.name === 'string' && typeof e.stack === 'string';

    return {
        isError,
        value: err,
        message: hasMessage ? String(e.message) : String(err),
        hasMessage: isError ? true : hasMessage,
        serializedError: serializeError(err)
    } as ThrownType;
}

/**
 * Builds handler functions for reporting matcher failures.
 *
 * @param expectedLabel - The label describing the expected value (e.g., 'constructor', 'substring').
 * @param expectedValue - The expected value representation (stringifies if necessary).
 * @param thrown - The thrown value or null.
 * @param asymmetric - Optional flag for asymmetric matchers.
 *
 * @returns A tuple `[handleNot, handleInfo]` for failure reporting.
 *
 * @see HandleNotType
 * @see HandleInfoType
 *
 * @since 1.0.0
 */

function buildInfo(expectedLabel: string, expectedValue: string, thrown: ThrownType | null, asymmetric = false): [ HandleNotType, HandleInfoType ] {
    const handleNot = (info: Array<string>): void => {
        info.push(`Expected ${ expectedLabel }: not ${ EXPECTED(expectedValue) }`);
        if (thrown?.hasMessage) {
            info.push(`Received message: ${ RECEIVED(serializeOneLine(asymmetric ? thrown.message : INVERSE(thrown.message))) }\n`);
        } else {
            info.push(`Received value:   ${ RECEIVED(serializeOneLine(thrown?.value)) }`);
        }
    };

    const handleInfo = (info: Array<string>): void => {
        info.push(`Expected ${ expectedLabel }: ${ EXPECTED(expectedValue) }`);
        if (thrown?.hasMessage) {
            if (asymmetric) {
                info.push(`Received name:    ${ RECEIVED(serializeOneLine((thrown.value as Error)?.name)) }`);
            }
            info.push(`Received message: ${ RECEIVED(serializeOneLine(thrown.message)) }\n`);
        } else {
            info.push(`Received value:   ${ RECEIVED(serializeOneLine(thrown?.value)) }`);
        }
    };

    return [ handleNot, handleInfo ] as const;
}

/**
 * Checks whether a thrown value matches an expected constructor.
 *
 * @param expected - The expected error constructor.
 * @param thrown - The thrown value or null.
 *
 * @returns A {@link ThrownValueType} tuple: `[pass, handleNot, handleInfo]`.
 *
 * @see ThrownValueType
 * @since 1.0.0
 */

export function toThrowExpectedClass(this: MatcherService, expected: ConstructorLikeType, thrown: ThrownType | null): ThrownValueType {
    const pass = thrown != null && thrown.value instanceof expected;
    const [ handleNot, handleInfo ] = buildInfo('constructor', expected.name, thrown);

    return [ pass, handleNot, handleInfo ];
}

/**
 * Checks whether a thrown error message contains an expected string.
 *
 * @param expected - The expected substring.
 * @param thrown - The thrown value or null.
 *
 * @returns A {@link ThrownValueType} tuple: `[pass, handleNot, handleInfo]`.
 *
 * @see ThrownValueType
 * @since 1.0.0
 */

export function toThrowExpectedString(this: MatcherService, expected: string, thrown: ThrownType | null): ThrownValueType {
    const pass = thrown != null && thrown.message.includes(expected);
    const [ handleNot, handleInfo ] = buildInfo('substring', `"${ expected }"`, thrown);

    return [ pass, handleNot, handleInfo ];
}

/**
 * Checks whether a thrown error message matches an expected RegExp.
 *
 * @param expected - The expected pattern.
 * @param thrown - The thrown value or null.
 *
 * @returns A {@link ThrownValueType} tuple: `[pass, handleNot, handleInfo]`.
 *
 * @see ThrownValueType
 * @since 1.0.0
 */

export function toThrowExpectedRegExp(this: MatcherService, expected: RegExp, thrown: ThrownType | null): ThrownValueType {
    const pass = thrown != null && expected.test(thrown.message);
    const [ handleNot, handleInfo ] = buildInfo('pattern', serializeOneLine(expected), thrown);

    return [ pass, handleNot, handleInfo ];
}

/**
 * Checks whether a thrown value matches an asymmetric matcher pattern.
 *
 * @param expected - The asymmetric pattern matcher.
 * @param thrown - The thrown value or null.
 *
 * @returns A {@link ThrownValueType} tuple: `[pass, handleNot, handleInfo]`.
 *
 * @see ThrownValueType
 * @since 1.0.0
 */

export function toThrowExpectedAsymmetric(this: MatcherService, expected: AbstractPattern, thrown: ThrownType | null): ThrownValueType {
    const pass = thrown != null && expected.matches(thrown.value);
    const [ handleNot, handleInfo ] = buildInfo('asymmetric', serializeOneLine(expected), thrown, true);

    return [ pass, handleNot, handleInfo ];
}

/**
 * Checks whether a thrown value matches an expected object.
 *
 * @param expected - The expected object.
 * @param thrown - The thrown value or null.
 *
 * @returns A {@link ThrownValueType} tuple: `[pass, handleNot, handleInfo]`.
 *
 * @see ThrownValueType
 * @since 1.0.0
 */

export function toThrowExpectedObject(this: MatcherService, expected: object, thrown: ThrownType): ThrownValueType {
    const pass = thrown != null && equals(serializeError(expected), thrown.serializedError);

    const handleNot = (info: Array<string>): void => {
        info.push(`Expected: not ${ EXPECTED(serializeOneLine(thrown.serializedError)) }`);
    };

    const handleInfo = (info: Array<string>): void => {
        info.push(diffComponent(expected, thrown.serializedError, true));
    };

    return [ pass, handleNot, handleInfo ];
}

/**
 * Captures any error thrown by the provided function or returns a formatted error from a rejection.
 *
 * @returns A normalized {@link ThrownType} object containing the thrown error details, or `null` if nothing was thrown.
 *
 * @remarks
 * This helper function processes errors from different sources:
 * - When `rejectsModifier` is active, formats the already-rejected value in `received`.
 * - When `received` is a function, executes it and captures any thrown errors.
 * - Otherwise returns `null` to indicate no error was thrown/captured.
 *
 * The returned {@link ThrownType} normalizes both Error instances and arbitrary values
 * into a consistent structure with type information, message extraction, and serialized form.
 *
 * @example
 * ```ts
 * // With a throwing function:
 * const thrown = captureThrown.call({ received: () => { throw new Error('Test error') } });
 * // Returns a ThrownType with the message "Test error" and isError=true
 *
 * // With a non-throwing function:
 * const thrown = captureThrown.call({ received: () => {} });
 * // Returns null
 *
 * // With a rejection:
 * const thrown = captureThrown.call({
 *   received: new Error('Rejected'),
 *   rejectsModifier: true
 * });
 * // Returns a ThrownType for the rejection
 * ```
 *
 * @see getThrown
 * @see ThrownType
 *
 * @since 2.1.3
 */

export function captureThrown(this: MatcherService): ThrownType | null {
    if (this.rejectsModifier) return getThrown(this.received);
    if (typeof this.received === 'function') {
        try {
            this.received();
        } catch (error) {
            return getThrown(error);
        }
    }

    return null;
}

/**
 * Asserts that a function or promise throws a value that matches the expected criteria.
 *
 * @param expected - Optional expectation: constructor, string, RegExp, object, or asymmetric pattern.
 *
 * @throws xJetTypeError - If `this.received` is not a function when expected, or if the expected type is invalid.
 *
 * @remarks
 * Supports multiple forms of expectation:
 * - Constructor: function must throw instance of that class.
 * - String: function must throw with message-containing substring.
 * - RegExp: function must throw with a message matching pattern.
 * - Object: function must throw an object equal to expected.
 * - Asymmetric: function must throw a value matching a custom pattern.
 *
 * Updates `this.received` with a serialized thrown value.
 * Delegates failure reporting to {@link handleFailure}.
 *
 * @example
 * ```ts
 * xExpect(() => { throw new Error('Oops'); }).toThrow('Oops');
 * xExpect(() => { throw new TypeError(); }).toThrow(TypeError);
 * xExpect(() => { throw { code: 123 }; }).toThrow({ code: 123 });
 * xExpect(() => { throw new Error('fail'); }).not.toThrow('pass');
 * ```
 *
 * @see MatcherService
 * @see ConstructorLikeType
 *
 * @since 1.0.0
 */

export function toThrow(this: MatcherService, expected?: RegExp | string | ConstructorLikeType | object): void {
    const thrown = captureThrown.call(this);
    const expectedLabels = expected ? [ 'expected' ] : [];

    if (!this.rejectsModifier && !this.resolvesModifier && typeof this.received !== 'function') {
        return ensureType.call(this, this.received, [ 'function' ], 'Received', expectedLabels);
    }

    let pass = false;
    let handleNot: HandleNotType;
    let handleInfo: HandleInfoType;
    if (!expected) {
        pass = thrown != null;
        handleNot = (info: Array<string>): void => {
            if (thrown?.hasMessage) {
                info.push(`Error name:    ${ RECEIVED((thrown.value as Error)?.name) }`);
                info.push(`Error message: ${ RECEIVED(serializeOneLine(thrown.message)) }\n`);
            } else {
                info.push(`Error value: ${ RECEIVED(serializeOneLine(thrown?.value)) }`);
            }
        };
    } else if (typeof expected === 'function') {
        [ pass, handleNot, handleInfo ] = toThrowExpectedClass.call(this, <ConstructorLikeType> expected, thrown);
    } else if (typeof expected === 'string') {
        expectedLabels[0] = expected;
        [ pass, handleNot, handleInfo ] = toThrowExpectedString.call(this, expected, thrown);
    } else if (expected instanceof RegExp) {
        expectedLabels[0] = String(expected);
        [ pass, handleNot, handleInfo ] = toThrowExpectedRegExp.call(this, expected, thrown);
    } else if (isAsymmetric(expected)) {
        expectedLabels[0] = String(expected.name);
        [ pass, handleNot, handleInfo ] = toThrowExpectedAsymmetric.call(this, expected, thrown);
    } else if (thrown !== null && typeof expected === 'object') {
        [ pass, handleNot, handleInfo ] = toThrowExpectedObject.call(this, expected, thrown);
    } else {
        ensureType.call(this, expected, [ 'string', 'function', 'RegExp', 'object' ], 'Expected', expectedLabels);
    }

    handleFailure.call(Object.assign({}, this, { received: thrown?.serializedError }), {
        pass,
        expected,
        expectedLabels,
        handleNot(this: MatcherService, info: Array<string>) {
            handleNot?.call(this, info);
        },
        handleInfo(this: MatcherService, info: Array<string>) {
            if (!thrown) {
                info.push(`${ RECEIVED('Received') } function did not throw`);
            } else {
                handleInfo?.call(this, info);
            }
        }
    });
}
