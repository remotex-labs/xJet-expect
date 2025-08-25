/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { ConstructorType, FunctionType } from '@interfaces/functions.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { equals } from '@components/object.component';
import { getType } from '@diff/components/diff.component';
import { serialize } from '@components/serialize.component';
import { handleFailure, serializeOneLine } from '@handlers/matchers.handler';
import { DIM, EXPECTED, INVERSE, MARK, RECEIVED } from '@components/color.component';
import { ensureNotNullish, ensureType, handleDiffFailure } from '@handlers/matchers.handler';

/**
 * Asserts that the received object contains the specified property path,
 * and optionally that the value at that path equals the expected value.
 *
 * @param path - Dot-separated string or array of strings representing the property path.
 * @param expectedValue - Optional expected value at the given path.
 *
 * @throws xJetTypeError - Throws if the received value is null/undefined, or if path is not string/array.
 *
 * @remarks
 * This matcher supports nested properties using dot notation.
 * If the `expectedValue` is provided, it also checks strict equality (Object.is) at the property path.
 *
 * @example
 * ```ts
 * expect({ a: { b: 42 } }).toHaveProperty('a.b', 42); // Passes
 * expect({ a: {} }).toHaveProperty(['a', 'b']); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveProperty(this: MatcherService<object>, path: string | Array<string>, expectedValue?: unknown): void {
    const expectedLabels = [ 'path', 'value' ];
    ensureNotNullish.call(this, this.received, 'Received', expectedLabels);
    ensureType.call(this, path, [ 'string', 'Array' ], 'Expected path', expectedLabels);

    let pass = true;
    let current = this.received;
    const pathFound: Array<string> = [];
    const pathArray = typeof path === 'string' ? path.split('.').filter(Boolean) : path;

    for (const segment of pathArray) {
        if (!current || !Object.hasOwn(current, segment)) {
            pass = false;
            break;
        }

        pathFound.push(segment);
        current = current[segment as keyof object];
    }

    if (pass && expectedValue !== undefined)
        pass = Object.is(current, expectedValue);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        handleNot(info) {
            info.push(`Expected: not ${ EXPECTED(serializeOneLine(pathArray)) }\n`);

            if (expectedValue) {
                info.push(`Expected value: ${ EXPECTED(serializeOneLine(expectedValue)) }`);
            } else {
                info.push(`Received value:     ${ RECEIVED(serializeOneLine(current)) }`);
            }
        },
        handleInfo(info) {
            info.push(`Expected path: ${ EXPECTED(serializeOneLine(pathArray)) }`);
            if (!Object.is(pathFound.join(''), pathArray.join('')))
                info.push(`Received path: ${ RECEIVED(serializeOneLine(pathFound)) }`);

            info.push('');
            if (expectedValue) {
                info.push(`Expected value: ${ EXPECTED(serializeOneLine(expectedValue)) }`);
            }

            info.push(`Expected value: ${ RECEIVED(serializeOneLine(current)) }`);
        }
    });
}


/**
 * Asserts that the received value is an instance of the provided constructor.
 *
 * @param instance - Constructor function or class to match against.
 *
 * @throws xJetTypeError - Throws if `instance` is not a function.
 *
 * @remarks
 * Useful for validating that a value is created from a specific class or constructor.
 * Works with built-in classes as well as custom constructors.
 *
 * @example
 * ```ts
 * expect(new Date()).toBeInstanceOf(Date); // Passes
 * expect({}).toBeInstanceOf(Array); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toBeInstanceOf(this: MatcherService, instance: FunctionType | ConstructorType): void {
    const expectedLabels = [ 'expected' ];
    ensureType.call(this, instance, [ 'function' ], 'Received', expectedLabels);

    const received = this.received;
    const pass = received instanceof instance;

    handleFailure.call(this, {
        pass,
        expectedLabels,
        handleNot(info) {
            info.push(`Expected constructor: not ${ EXPECTED(instance.name) }\n`);
        },
        handleInfo(info) {
            info.push(`Expected constructor: ${ EXPECTED(instance.name) }`);

            if (received !== null && typeof received === 'object' && Object.getPrototypeOf(received) !== null && 'constructor' in received) {
                info.push(`Received constructor: ${ RECEIVED((received as object).constructor.name) }`);
            } else {
                info.push('\nReceived value has no prototype');
                info.push(`Received value: ${ RECEIVED(serializeOneLine(received)) }`);
            }
        }
    });
}

/**
 * Asserts that the received string or array contains the expected value.
 *
 * @param expected - The value or substring to search for.
 *
 * @throws xJetTypeError - Throws if received is a string and expected is not a string,
 *                         or if received is not string/array.
 *
 * @remarks
 * For arrays, this matcher uses reference equality.
 * For strings, it checks for substring inclusion.
 * Use `toContainEqual` for deep equality in arrays.
 *
 * @example
 * ```ts
 * expect([1, 2, 3]).toContain(2); // Passes
 * expect('hello world').toContain('world'); // Passes
 * ```
 *
 * @since 1.0.0
 */

export function toContain(this: MatcherService<Array<unknown> | string>, expected: unknown): void {
    const expectedLabels = [ 'expected' ];
    ensureType.call(this, this.received, [ 'string', 'Array' ], 'Received', expectedLabels);

    const received = this.received;
    const receivedType = getType(received);

    if (typeof received === 'string' && typeof expected !== 'string') {
        throw new xJetTypeError({
            expectedLabels,
            message: `${ EXPECTED('expected') } value must be a string if ${ RECEIVED('received') } value is a string`,
            expected: { value: expected, type: getType(expected) },
            received: { value: received, type: receivedType },
            assertionChain: this.assertionChain
        });
    }

    const index = received.indexOf(<string>expected);
    const pass = index !== -1;

    handleFailure.call(this, {
        pass,
        expectedLabels,
        comment: 'indexOf',
        handleNot(info) {
            if (receivedType === 'string') {
                info.push(`Expected substring: not ${ EXPECTED(serializeOneLine(expected)) }`);
                info.push(`Received string:        ${ RECEIVED(serializeOneLine(received)).replace(
                    String(expected), INVERSE(String(expected))
                ) }`);
            } else {
                info.push(`Expected value: not ${ EXPECTED(serializeOneLine(expected)) }`);
                info.push(`Received array:     ${ RECEIVED(serializeOneLine(received)).replace(
                    serializeOneLine(expected), INVERSE(serializeOneLine(expected))
                ) }`);
            }
        },
        handleInfo(info) {
            if (receivedType === 'string') {
                info.push(`Expected substring: ${ EXPECTED(serialize(expected, '').join('\n')) }`);
                info.push(`Received string:    ${ RECEIVED(serialize(receivedType, '').join('\n')) }`);
            } else {
                const x = [ ...received ].findIndex(item =>
                    equals(item, expected)
                );

                if (x !== -1) {
                    info.push(
                        DIM(
                            'Looks like you wanted to test for object/array equality with the stricter `toContain` matcher.\n' +
                            `You probably need to use \`${ MARK('toContainEqual') }\` instead.\n`
                        )
                    );
                }

                info.push(`Expected value: ${ EXPECTED(serializeOneLine(expected)) }`);
                info.push(`Received array: ${ RECEIVED(serializeOneLine(receivedType)) }`);
            }
        }
    });
}

/**
 * Asserts that the received array contains an element deeply equal to the expected value.
 *
 * @param expected - The value to search for using deep equality.
 *
 * @throws xJetTypeError - Throws if received is not an array.
 *
 * @remarks
 * Use this matcher when you need deep equality comparison (e.g., objects or arrays inside an array).
 * For primitive arrays or substring checks, use `toContain`.
 *
 * @example
 * ```ts
 * expect([{ a: 1 }, { b: 2 }]).toContainEqual({ a: 1 }); // Passes
 * ```
 *
 * @since 1.0.0
 */

export function toContainEqual(this: MatcherService<Array<unknown>>, expected: unknown): void {
    const expectedLabels = [ 'expected' ];
    ensureType.call(this, this.received, [ 'string', 'Array' ], 'Received', expectedLabels);

    const received = this.received;
    const receivedType = getType(received);


    const index = [ ...received ].findIndex(item =>
        equals(item, expected)
    );

    const pass = index !== -1;
    handleFailure.call(this, {
        pass,
        expectedLabels,
        comment: 'deep equality',
        handleNot(info) {
            info.push(`Expected value: not ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push(`Received array:     ${ RECEIVED(serializeOneLine(received)).replace(
                serializeOneLine(expected), INVERSE(serializeOneLine(expected))
            ) }`);
        },
        handleInfo(info) {
            if (receivedType === 'string' && typeof expected === 'string' && received.indexOf(expected) !== -1) {
                info.push(
                    DIM(
                        'Looks like you wanted to test for string equality with the stricter `toContainEqual` matcher. ' +
                        'You probably need to use `toContain` instead.\n'
                    )
                );
            }

            info.push(`Expected: ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push(`Received: ${ RECEIVED(serializeOneLine(received)) }`);
        }
    });
}

/**
 * Asserts that the received object matches the expected object.
 * Performs a deep equality comparison for all keys in the expected object.
 *
 * @param expected - The expected object to match against.
 *
 * @throws xJetTypeError - Throws if received or expected is not an object.
 *
 * @remarks
 * Only the keys present in `expected` are checked. Extra keys in the received object are ignored.
 * Useful for partial object matching.
 *
 * @example
 * ```ts
 * expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); // Passes
 * expect({ a: 1 }).toMatchObject({ a: 1, b: 2 }); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toMatchObject(this: MatcherService<object>, expected: object): void {
    const expectedLabels = [ 'expected' ];
    ensureNotNullish.call(this, this.received, 'Received', expectedLabels);
    ensureType.call(this, this.received, [ 'object' ], 'Received', expectedLabels);
    ensureType.call(this, expected, [ 'object' ], 'Expected', expectedLabels);

    const received = this.received;
    const pass = equals(received, expected);

    handleDiffFailure.call(this, {
        pass,
        expected,
        expectedLabels
    });
}
