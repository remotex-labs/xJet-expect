import type { MatcherService } from '@services/matcher.service';
import type { ConstructorType, FunctionType } from '@interfaces/function.interface';
import { xJetTypeError } from '@errors/type.error';
import { equals } from '@components/object.component';
import { handleDiffFailure, handleFailure } from '@matchers/base.matcher';
import { getType } from '@diff/components/diff.component';
import { serialize } from '@diff/components/serialize.component';
import { DIM, EXPECTED, INVERSE, RECEIVED } from '@components/color.component';

export function toHaveProperty(this: MatcherService, path: string | Array<string>, expectedValue?: unknown): void {
    const actual = this.actual;

    if (actual === null || actual === undefined) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must not be null nor undefined`,
            received: { value: actual }
        });
    }

    const pathType = getType(path);
    if (pathType !== 'string' && pathType !== 'Array') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } path must be a string or array`,
            expected: { type: pathType, value: path }
        });
    }

    let pass = true;
    let current: object = actual;
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
        name: 'toHaveProperty',
        params: [ 'path', 'value' ],
        handleNot(info) {
            info.push(`Expected: not ${ EXPECTED(serialize(pathArray, '').join('')) }\n`);

            if (expectedValue) {
                info.push(`Expected value: ${ EXPECTED(serialize(expectedValue, '').join('')) }`);
            } else {
                info.push(`Received value:     ${ RECEIVED(serialize(current, '').join('')) }`);
            }
        },
        handleInfo(info) {
            info.push(`Expected path: ${ EXPECTED(serialize(pathArray, '').join('')) }`);
            if (!Object.is(pathFound.join(''), pathArray.join('')))
                info.push(`Received path: ${ RECEIVED(serialize(pathFound, '').join('')) }`);

            info.push('');
            if (expectedValue) {
                info.push(`Expected value: ${ EXPECTED(serialize(expectedValue, '').join('')) }`);
            }

            info.push(`Expected value: ${ RECEIVED(serialize(current, '').join('')) }`);
        }
    });
}

export function toBeInstanceOf(this: MatcherService, expected: FunctionType | ConstructorType): void {
    const actual = this.actual;
    const expectedType = getType(expected);
    if (expectedType !== 'function') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a function or class`,
            received: { value: expected, type: expectedType }
        });
    }

    const pass = this.actual instanceof expected;
    handleFailure.call(this, {
        pass,
        name: 'toBeInstanceOf',
        params: [ 'expected' ],
        handleNot(info) {
            info.push(`Expected constructor: not ${ EXPECTED(expected.name) }\n`);
        },
        handleInfo(info) {
            info.push(`Expected constructor: ${ EXPECTED(expected.name) }`);

            if (actual !== null && typeof actual === 'object' && Object.getPrototypeOf(actual) !== null && 'constructor' in actual) {
                info.push(`Received constructor: ${ RECEIVED((actual as object).constructor.name) }`);
            } else {
                info.push('\nReceived value has no prototype');
                info.push(`Received value: ${ RECEIVED(serialize(actual, '').join('')) }`);
            }
        }
    });
}

export function toContain(this: MatcherService, expected: unknown): void {
    const actual = <Array<unknown>>this.actual;
    const actualType = getType(actual);

    if (actualType !== 'string' && actual === null && typeof actual[Symbol.iterator] !== 'function') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must be a string or iterable object`,
            received: { value: actual, type: actualType }
        });
    }

    if (actualType === 'string' && typeof expected !== 'string') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('expected') } value must be a string if ${ RECEIVED('received') } value is a string`,
            expected: { value: expected, type: getType(expected) },
            received: { value: actual, type: actualType }
        });
    }

    const index = actual.indexOf(expected);
    const pass = index !== -1;

    handleFailure.call(this, {
        pass,
        name: 'toContain',
        params: [ 'expected' ],
        hintLabel: 'indexOf',
        handleNot(info) {
            if (actualType === 'string') {
                info.push(`Expected substring: not ${ EXPECTED(serialize(expected, '').join('')) }`);
                info.push(`Received string:        ${ RECEIVED(serialize(actual, '').join('')).replace(
                    String(expected), INVERSE(String(expected))
                ) }`);
            } else {
                info.push(`Expected value: not ${ EXPECTED(serialize(expected, '').join('')) }`);
                info.push(`Received array:     ${ RECEIVED(serialize(actual, '').join('')).replace(
                    serialize(expected, '').join(''), INVERSE(serialize(expected, '').join(''))
                ) }`);
            }
        },
        handleInfo(info) {
            if (actualType === 'string') {
                info.push(`Expected substring: ${ EXPECTED(serialize(expected).join('\n')) }`);
                info.push(`Received string:    ${ RECEIVED(serialize(actual).join('\n')) }`);
            } else {
                const x = [ ...actual ].findIndex(item =>
                    equals(item, expected)
                );

                if(x !== -1) {
                    info.push(
                        DIM(
                            'Looks like you wanted to test for object/array equality with the stricter `toContain` matcher. ' +
                            'You probably need to use `toContainEqual` instead.\n'
                        )
                    );
                }

                info.push(`Expected value: ${ EXPECTED(serialize(expected, '').join('')) }`);
                info.push(`Received array: ${ RECEIVED(serialize(actual, '').join('')) }`);
            }
        }
    });
}

export function toContainEqual(this: MatcherService, expected: unknown): void {
    const actual = <Array<unknown>>this.actual;
    const actualType = getType(actual);

    if (actual == null && typeof actual[Symbol.iterator] !== 'function') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must not be null nor undefined`,
            received: { value: actual, type: actualType }
        });
    }

    const index = [ ...actual ].findIndex(item =>
        equals(item, expected)
    );

    const pass = index !== -1;
    handleFailure.call(this, {
        pass,
        name: 'toContainEqual',
        params: [ 'expected' ],
        hintLabel: 'deep equality',
        handleNot(info) {
            info.push(`Expected value: not ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received array:     ${ RECEIVED(serialize(actual, '').join('')).replace(
                serialize(expected, '').join(''), INVERSE(serialize(expected, '').join(''))
            ) }`);
        },
        handleInfo(info) {
            if(actualType === 'string' && typeof expected === 'string' && actual.indexOf(expected) !== -1) {
                info.push(
                    DIM(
                        'Looks like you wanted to test for string equality with the stricter `toContainEqual` matcher. ' +
                        'You probably need to use `toContain` instead.\n'
                    )
                );
            }

            info.push(`Expected: ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received: ${ RECEIVED(serialize(actual, '').join('')) }`);
        }
    });
}

export function toMatchObject(this: MatcherService, expected: object): void {
    const actual = <object> this.actual;
    const actualType = getType(actual);

    if (typeof actual !== 'object' || actual === null) {
        throw new xJetTypeError({
            params: [ 'expected' ],
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must be a non-null object`,
            received: { value: actual, type: actualType }
        });
    }

    const expectedType = getType(expected);
    if (typeof expected !== 'object' || expected === null) {
        throw new xJetTypeError({
            params: [ 'expected' ],
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a non-null object`,
            expected: { value: expected, type: expectedType }
        });
    }

    const pass = equals(actual, expected);
    handleDiffFailure.call(this, {
        pass,
        expected,
        name: 'toMatchObject',
        params: [ 'expected' ]
    });
}
