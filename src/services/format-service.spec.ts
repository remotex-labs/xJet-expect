/**
 * Import will remove at compile time
 */

import type { FunctionLikeType } from '@interfaces/function.interface';

/**
 * Imports
 */

import { getType, formatHint, formatWithType, stringify, formatErrorMessage } from '@services/format.service';

/**
 * Mock dependencies
 */

jest.mock('@remotex-labs/xansi', () => ({
    xterm: {
        dim: (text: string) => `dim:${ text }`,
        bold: (text: string) => `bold:${ text }`,
        red: (text: string) => `red:${ text }`,
        green: (text: string) => `green:${ text }`,
        inverse: (text: string) => `inverse:${ text }`
    }
}));


/**
 * Tests
 */

describe('stringify', () => {
    test('should stringify primitive values', () => {
        expect(stringify('test')).toBe('"test"');
        expect(stringify(123)).toBe('123');
        expect(stringify(true)).toBe('true');
        expect(stringify(null)).toBe('null');
        expect(stringify(undefined)).toBe('undefined');
    });

    test('should format Error objects correctly', () => {
        const error = new Error('test error');
        expect(stringify(error)).toBe('"[Error: test error]"');

        const objWithError = { err: new Error('nested error') };
        expect(stringify(objWithError)).toContain('"err": "[Error: nested error]"');
    });

    test('should detect and handle circular references', () => {
        const circular: Record<string, unknown> = { name: 'circular object' };
        circular.self = circular;

        expect(stringify(circular)).toBe('{"name": "circular object","self": "[Circular]"}');
    });

    test('should limit object depth according to maxDepth parameter', () => {
        const nested = {
            level1: {
                level2: {
                    level3: {
                        level4: { deep: 'value' }
                    }
                }
            }
        };

        // Default maxDepth is 3
        expect(stringify(nested)).toBe(
            '{"level1": {"level2": {"level3": "[Object]"}}}'
        );

        // Set maxDepth to 4
        expect(stringify(nested, 4)).toBe(
            '{"level1": {"level2": {"level3": {"level4": "[Object]"}}}}'
        );

        // Set maxDepth to 1
        expect(stringify(nested, 1)).toBe('{"level1": "[Object]"}');
    });

    test('should handle arrays properly', () => {
        const array = [ 1, 2, [ 3, 4, [ 5, 6, [ 7, 8 ]]]];

        // Default maxDepth is 3
        expect(stringify(array)).toBe('[1,2,[3,4,[5,6,"[Object]"]]]');

        // Set maxDepth to 4
        expect(stringify(array, 4)).toBe('[1,2,[3,4,[5,6,[7,8]]]]');
    });

    test('should handle mixed complex objects', () => {
        const complex = {
            string: 'value',
            number: 42,
            array: [ 1, 2, 3 ],
            nested: {
                prop: 'nested value',
                error: new Error('nested error')
            }
        };

        const result = stringify(complex);

        expect(result).toContain('"string": "value"');
        expect(result).toContain('"number": 42');
        expect(result).toContain('"array": [1,2,3]');
        expect(result).toContain('"nested": {');
        expect(result).toContain('"prop": "nested value"');
        expect(result).toContain('"error": "[Error: nested error]"');
    });

    test('should handle empty objects and arrays', () => {
        expect(stringify({})).toBe('{}');
        expect(stringify([])).toBe('[]');
    });

    test('should properly format output with spaces after colons', () => {
        const obj = { key: 'value' };
        expect(stringify(obj)).toBe('{"key": "value"}');
        // Verify the replace function works
        expect(stringify(obj)).not.toBe('{"key":"value"}');
    });
});

describe('getType', () => {
    // Test all primitive and common object types with test.each
    test.each([
        // [description, value, expectedType]
        [ 'undefined', undefined, 'undefined' ],
        [ 'null', null, 'null' ], // null is typeof 'object' in JavaScript
        [ 'string', 'hello world', 'string' ],
        [ 'empty string', '', 'string' ],
        [ 'number', 42, 'number' ],
        [ 'zero', 0, 'number' ],
        [ 'NaN', NaN, 'number' ],
        [ 'Infinity', Infinity, 'number' ],
        [ 'negative number', -123, 'number' ],
        [ 'boolean true', true, 'boolean' ],
        [ 'boolean false', false, 'boolean' ],
        [ 'BigInt', BigInt(9007199254740991), 'bigint' ],
        [ 'Symbol', Symbol('test'), 'symbol' ],
        [ 'function', () => {}, 'function' ],
        [ 'arrow function', () => 'test', 'function' ],
        [ 'Array', [ 1, 2, 3 ], 'Array' ],
        [ 'empty Array', [], 'Array' ],
        [ 'Object', { a: 1, b: 2 }, 'Object' ],
        [ 'empty Object', {}, 'Object' ],
        [ 'RegExp', /test/g, 'RegExp' ],
        [ 'Map', new Map([[ 'key', 'value' ]]), 'Map' ],
        [ 'empty Map', new Map(), 'Map' ],
        [ 'Set', new Set([ 1, 2, 3 ]), 'Set' ],
        [ 'empty Set', new Set(), 'Set' ],
        [ 'Date', new Date(), 'Date' ],
        [ 'Promise', Promise.resolve(), 'Promise' ]
    ])('should return correct type for %s', (_, value, expectedType) => {
        expect(getType(value)).toBe(expectedType);
    });

    test('should handle custom class instances', () => {
        class Person {
            constructor(public name: string) {}
        }
        const person = new Person('John');

        expect(getType(person)).toBe('Person');
    });

    test('should handle anonymous class instances', () => {
        const AnonymousClass = class {
            property = 'value';
        };
        const instance = new AnonymousClass();

        // Anonymous classes typically get a name like "AnonymousClass" or ""
        const result = getType(instance);
        expect(result === 'Object' || result === '' || result.includes('Anonymous')).toBeTruthy();
    });

    test('should return "Object" for object with null prototype', () => {
        const obj = Object.create(null);
        obj.test = 'value';

        expect(getType(obj)).toBe('Object');
    });

    test('should handle objects with custom toString but no constructor', () => {
        const obj = {
            toString() { return 'CustomToString'; }
        };
        Object.setPrototypeOf(obj, null);

        expect(getType(obj)).toBe('Object');
    });

    test('should handle global objects', () => {
        expect(getType(Math)).toBe('Object');
        expect(getType(JSON)).toBe('Object');
        expect(getType(globalThis)).toBe(typeof globalThis === 'object' ? globalThis.constructor?.name ?? 'Object' : typeof globalThis);
    });

    test('should handle inherited objects', () => {
        class Parent {}
        class Child extends Parent {}
        const child = new Child();

        expect(getType(child)).toBe('Child');
    });

    test('should handle proxied objects', () => {
        const obj = { name: 'original' };
        const proxy = new Proxy(obj, {});

        expect(getType(proxy)).toBe('Object');
    });
});

describe('formatWithType', () => {
    // Define a simple print function for tests
    const mockPrint: FunctionLikeType<string, [ unknown ]> = jest.fn(val =>
        typeof val === 'object' ? JSON.stringify(val) : String(val)
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should format primitive values correctly', () => {
        // Test with string
        expect(formatWithType('myString', 'hello', mockPrint))
            .toBe('myString has type: string\nmyString has value: hello');

        // Test with number
        expect(formatWithType('myNumber', 42, mockPrint))
            .toBe('myNumber has type: number\nmyNumber has value: 42');

        // Test with boolean
        expect(formatWithType('myBoolean', true, mockPrint))
            .toBe('myBoolean has type: boolean\nmyBoolean has value: true');
    });

    test('should handle null and undefined correctly', () => {
        // Test with null
        expect(formatWithType('myNull', null, mockPrint))
            .toBe('myNull has value: null');

        // Test with undefined
        expect(formatWithType('myUndefined', undefined, mockPrint))
            .toBe('myUndefined has value: undefined');
    });

    test('should use constructor name for objects with a constructor', () => {
        // Test with Date object
        const date = new Date('2023-01-01');
        expect(formatWithType('myDate', date, mockPrint))
            .toBe(`myDate has type: Date\nmyDate has value: ${ mockPrint(date) }`);

        // Test with Array
        const array = [ 1, 2, 3 ];
        expect(formatWithType('myArray', array, mockPrint))
            .toBe(`myArray has type: Array\nmyArray has value: ${ JSON.stringify(array) }`);

        // Test with custom class
        class Person {
            constructor(public name: string) {
            }
        }

        const person = new Person('John');
        expect(formatWithType('myPerson', person, mockPrint))
            .toBe(`myPerson has type: Person\nmyPerson has value: ${ JSON.stringify(person) }`);
    });

    test('should use "Object" for objects without a constructor name', () => {
        // Test with plain object
        const obj = { name: 'John', age: 30 };
        expect(formatWithType('myObj', obj, mockPrint))
            .toBe(`myObj has type: Object\nmyObj has value: ${ JSON.stringify(obj) }`);

        // Test with object with null prototype
        const noProtoObj = Object.create(null);
        noProtoObj.test = 'value';
        expect(formatWithType('noProtoObj', noProtoObj, mockPrint))
            .toBe(`noProtoObj has type: Object\nnoProtoObj has value: ${ JSON.stringify(noProtoObj) }`);
    });

    test('should correctly use the provided print function', () => {
        const customPrint: FunctionLikeType<string, [ unknown ]> = jest.fn(val =>
            `Custom format: ${ val }`
        );

        expect(formatWithType('myValue', 123, customPrint))
            .toBe('myValue has type: number\nmyValue has value: Custom format: 123');

        expect(customPrint).toHaveBeenCalledWith(123);
        expect(customPrint).toHaveBeenCalledTimes(1);
    });

    test('should handle objects with circular references', () => {
        // Since we're using a mock print function, we need to handle circular references
        const circularObj: any = { name: 'Circular' };
        circularObj.self = circularObj;

        const safeJsonPrint: FunctionLikeType<string, [ unknown ]> = val => {
            try {
                return JSON.stringify(val);
            } catch {
                return '[Circular Object]';
            }
        };

        expect(formatWithType('circularObj', circularObj, safeJsonPrint))
            .toBe('circularObj has type: Object\ncircularObj has value: [Circular Object]');
    });

    test('should handle empty objects correctly', () => {
        expect(formatWithType('emptyObj', {}, mockPrint))
            .toBe('emptyObj has type: Object\nemptyObj has value: {}');
    });

    test('should handle function values correctly', () => {
        const fn = () => 'test';
        expect(formatWithType('myFunction', fn, mockPrint))
            .toBe('myFunction has type: function\nmyFunction has value: ' + String(fn));
    });
});

describe('formatHint', () => {
    describe('basic functionality', () => {
        test('should generate basic matcher hint with default parameters', () => {
            const result = formatHint('toBe');
            expect(result).toBe('dim:expect(red:receiveddim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should generate basic matcher hint with custom parameters', () => {
            const result = formatHint('toBe', 'actualValue', 'expectedValue');
            expect(result).toBe('dim:expect(red:actualValuedim:)dim:.toBedim:(green:expectedValuedim:)');
        });

        test('should handle empty matcher name', () => {
            const result = formatHint('', 'value', 'expected');
            expect(result).toBe('dim:expect(red:valuedim:)dim:.dim:(green:expecteddim:)');
        });
    });

    describe('options handling', () => {
        test('should handle isNot=true option', () => {
            const result = formatHint('toBe', 'value', 'expected', { isNot: true });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.notdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle comment option', () => {
            const result = formatHint('toBe', 'value', 'expected', { comment: 'test comment' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)dim: // test comment');
        });

        test('should handle empty comment option', () => {
            const result = formatHint('toBe', 'value', 'expected', { comment: '' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle promise option with resolves', () => {
            const result = formatHint('toBe', 'value', 'expected', { promise: 'resolves' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.resolvesdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle promise option with rejects', () => {
            const result = formatHint('toBe', 'value', 'expected', { promise: 'rejects' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.rejectsdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle empty promise option', () => {
            const result = formatHint('toBe', 'value', 'expected', { promise: '' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle secondArgument option', () => {
            const result = formatHint('toBeCloseTo', 'value', 'expected', { secondArgument: '2' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBeCloseTodim:(green:expecteddim:, green:2dim:)');
        });

        test('should handle empty secondArgument option', () => {
            const result = formatHint('toBe', 'value', 'expected', { secondArgument: '' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle isDirectExpectCall=true option', () => {
            const result = formatHint('toBe', 'value', 'expected', { isDirectExpectCall: true });
            expect(result).toBe('expectdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle custom expectedColor function', () => {
            const customExpectedColor = (text: string) => `custom-expected:${ text }`;
            const result = formatHint('toBe', 'value', 'expected', { expectedColor: customExpectedColor });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(custom-expected:expecteddim:)');
        });

        test('should handle custom receivedColor function', () => {
            const customReceivedColor = (text: string) => `custom-received:${ text }`;
            const result = formatHint('toBe', 'value', 'expected', { receivedColor: customReceivedColor });
            expect(result).toBe('dim:expect(custom-received:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle custom secondArgumentColor function', () => {
            const customSecondArgumentColor = (text: string) => `custom-arg:${ text }`;
            const result = formatHint('toBe', 'value', 'expected', {
                secondArgument: 'precision',
                secondArgumentColor: customSecondArgumentColor
            });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:, custom-arg:precisiondim:)');
        });

        test('should handle all options combined', () => {
            const customExpectedColor = (text: string) => `custom-expected:${ text }`;
            const customReceivedColor = (text: string) => `custom-received:${ text }`;
            const customSecondArgumentColor = (text: string) => `custom-arg:${ text }`;

            const result = formatHint('toBe', 'value', 'expected', {
                isNot: true,
                comment: 'test comment',
                promise: 'rejects',
                secondArgument: 'precision',
                isDirectExpectCall: false,
                expectedColor: customExpectedColor,
                receivedColor: customReceivedColor,
                secondArgumentColor: customSecondArgumentColor
            });

            expect(result).toBe(
                'dim:expect(custom-received:valuedim:)dim:.rejectsdim:.notdim:.toBedim:(custom-expected:expecteddim:, custom-arg:precisiondim:)dim: // test comment'
            );
        });
    });

    describe('matcher name handling', () => {
        test('should handle simple matcher names', () => {
            const result = formatHint('toBe', 'value', 'expected');
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle matcher names with dots', () => {
            const result = formatHint('asymmetricMatcher.toBe', 'value', 'expected');
            expect(result).toBe('dim:expect(red:valuedim:)asymmetricMatcher.toBedim:(green:expecteddim:)');
        });

        test('should handle matcher names with multiple dots', () => {
            const result = formatHint('namespace.asymmetricMatcher.toBe', 'value', 'expected');
            expect(result).toBe('dim:expect(red:valuedim:)namespace.asymmetricMatcher.toBedim:(green:expecteddim:)');
        });
    });

    describe('arguments handling', () => {
        test('should handle null received value', () => {
            const result = formatHint('toBe', null, 'expected');
            expect(result).toBe('dim:expect(red:nulldim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle undefined received value', () => {
            const result = formatHint('toBe', undefined, 'expected');
            expect(result).toBe('dim:expect(red:receiveddim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle empty string received value', () => {
            const result = formatHint('toBe', '', 'expected');
            expect(result).toBe('expectdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle number 0 received value', () => {
            const result = formatHint('toBe', 0, 'expected');
            expect(result).toBe('expectdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle boolean false received value', () => {
            const result = formatHint('toBe', false, 'expected');
            expect(result).toBe('expectdim:.toBedim:(green:expecteddim:)');
        });

        test('should handle null expected value', () => {
            const result = formatHint('toBe', 'value', null);
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:nulldim:)');
        });

        test('should handle undefined expected value', () => {
            const result = formatHint('toBe', 'value', undefined);
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle empty string expected value', () => {
            const result = formatHint('toBe', 'value', '');
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:()');
        });

        test('should handle number 0 expected value', () => {
            const result = formatHint('toBe', 'value', 0);
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:()');
        });

        test('should handle boolean false expected value', () => {
            const result = formatHint('toBe', 'value', false);
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:()');
        });
    });

    describe('edge cases', () => {
        test('should handle empty options object', () => {
            const result = formatHint('toBe', 'value', 'expected', {});
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)');
        });

        test('should handle special characters in strings', () => {
            const result = formatHint('toBe', 'val"ue', 'exp\'ected');
            expect(result).toBe('dim:expect(red:val"uedim:)dim:.toBedim:(green:exp\'ecteddim:)');
        });

        test('should handle matcher name with only dots', () => {
            const result = formatHint('...', 'value', 'expected');
            expect(result).toBe('dim:expect(red:valuedim:)...dim:(green:expecteddim:)');
        });

        test('should handle special characters in comment', () => {
            const result = formatHint('toBe', 'value', 'expected', { comment: 'test // comment' });
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:expecteddim:)dim: // test // comment');
        });

        test('should handle all falsy values combined', () => {
            const result = formatHint('', '', '', {
                isNot: false,
                comment: '',
                promise: '',
                secondArgument: '',
                isDirectExpectCall: false
            });
            expect(result).toBe('expectdim:.dim:()');
        });

        test('should handle non-string inputs by converting them to strings', () => {
            const result = formatHint('toBe', 123, { key: 'value' });
            expect(result).toBe('dim:expect(red:123dim:)dim:.toBedim:(green:[object Object]dim:)');
        });

        test('should handle special expected value', () => {
            const result = formatHint('toBe', 'value', [ 'special', 'array' ]);
            expect(result).toBe('dim:expect(red:valuedim:)dim:.toBedim:(green:special,arraydim:)');
        });
    });
});

describe('formatErrorMessage', () => {
    test('should format error message with hint and generic message only', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Expected values to be strictly equal';

        const result = formatErrorMessage(hint, generic, 'Matcher error');

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Expected values to be strictly equal'
        );
    });

    test('should format error message with hint, generic, and specific message', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Expected values to be strictly equal';
        const specific = 'Expected: 5\nReceived: 10';

        const result = formatErrorMessage(hint, generic, 'Matcher error', specific);

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Expected values to be strictly equal\n\n' +
            'Expected: 5\nReceived: 10'
        );
    });

    test('should handle empty hint', () => {
        const hint = '';
        const generic = 'Error occurred';

        const result = formatErrorMessage(hint, generic, 'Matcher error');

        expect(result).toBe(
            '\n\nbold:Matcher error: Error occurred'
        );
    });

    test('should handle empty generic message', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = '';

        const result = formatErrorMessage(hint, generic, 'Matcher error');

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: '
        );
    });

    test('should handle empty specific message', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred';
        const specific = '';

        const result = formatErrorMessage(hint, generic,'Matcher error' , specific);

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred\n\n'
        );
    });

    test('should handle multiline hint', () => {
        const hint = 'expect(received)\n  .toBe(expected)';
        const generic = 'Error occurred';

        const result = formatErrorMessage(hint, generic, 'Matcher error');

        expect(result).toBe(
            'expect(received)\n  .toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred'
        );
    });

    test('should handle multiline generic message', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred\nPlease check your input';

        const result = formatErrorMessage(hint, generic, 'Matcher error');

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred\nPlease check your input'
        );
    });

    test('should handle multiline specific message', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred';
        const specific = 'Expected:\n  5\nReceived:\n  10';

        const result = formatErrorMessage(hint, generic, undefined, specific);

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'Error occurred\n\n' +
            'Expected:\n  5\nReceived:\n  10'
        );
    });

    test('should handle non-string specific value', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred';
        const specific = null;

        const result = formatErrorMessage(hint, generic, 'Matcher error', specific as any);

        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred'
        );
    });

    test('should handle specific value as number', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred';
        const specific = 42 as any; // TypeScript would normally prevent this

        const result = formatErrorMessage(hint, generic, 'Matcher error', specific);

        // Since it's checking typeof specific === 'string', non-strings are ignored
        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred'
        );
    });

    test('should handle specific value as boolean', () => {
        const hint = 'expect(received).toBe(expected)';
        const generic = 'Error occurred';
        const specific = true as any; // TypeScript would normally prevent this

        const result = formatErrorMessage(hint, generic, 'Matcher error', specific);

        // Since it's checking typeof specific === 'string', non-strings are ignored
        expect(result).toBe(
            'expect(received).toBe(expected)\n\n' +
            'bold:Matcher error: Error occurred'
        );
    });

    test('should handle special characters in messages', () => {
        const hint = 'expect(received).toBe("special\nchars")';
        const generic = 'Error with "quotes" and \'apostrophes\'';
        const specific = 'Contains \t tabs and \n newlines';

        const result = formatErrorMessage(hint, generic, 'Matcher error', specific);

        expect(result).toBe(
            'expect(received).toBe("special\nchars")\n\n' +
            'bold:Matcher error: Error with "quotes" and \'apostrophes\'\n\n' +
            'Contains \t tabs and \n newlines'
        );
    });
});
