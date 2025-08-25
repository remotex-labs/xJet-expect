/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';
import { asymmetricMatch, equals, hasKey, isA } from '@components/object.component';

/**
 * Mock dependencies
 */

class MockAsymmetricMatcher extends AbstractPattern {
    expectedLabel = 'MockAsymmetricMatcher';

    constructor(private expectedValue: unknown) {
        super('MockAsymmetricMatcher');
    }

    matches(actual: unknown): boolean {
        return actual === this.expectedValue;
    }
}

/**
 * Tests
 */

describe('isA function', () => {
    test('should return true when value is of the specified constructor', () => {
        expect(isA(String, 'test')).toBe(true);
        expect(isA(Number, 123)).toBe(true);
        expect(isA(Boolean, true)).toBe(true);
        expect(isA(Date, new Date())).toBe(true);
        expect(isA(RegExp, /test/)).toBe(true);
        expect(isA(Array, [ 1, 2, 3 ])).toBe(true);
        expect(isA(Object, { key: 'value' })).toBe(true);
    });

    test('should return false when value is not of the specified constructor', () => {
        expect(isA(Number, 'test')).toBe(false);
        expect(isA(String, 123)).toBe(false);
        expect(isA(Date, '2023-01-01')).toBe(false);
        expect(isA(RegExp, 'test')).toBe(false);
    });

    test('should return false for null and undefined values', () => {
        expect(isA(String, null)).toBe(false);
        expect(isA(Number, undefined)).toBe(false);
    });

    test('should handle primitive wrapper objects correctly', () => {
        expect(isA(String, 'test')).toBe(true);
        expect(isA(Number, 123)).toBe(true);
        expect(isA(Boolean, true)).toBe(true);
    });

    test('should handle custom classes correctly', () => {
        class Person {
            constructor(public name: string) {
            }
        }

        const person = new Person('John');
        expect(isA(Person, person)).toBe(true);
        expect(isA(Object, person)).toBe(false);
    });

    test('should handle inheritance correctly', () => {
        class Animal {
        }

        class Dog extends Animal {
        }

        const dog = new Dog();
        expect(isA(Dog, dog)).toBe(true);
        // This returns false because dog.constructor is Dog, not Animal
        expect(isA(Animal, dog)).toBe(false);
    });

    test('should return true for jest.fn mock functions when checking for Function', () => {
        const mockFn = jest.fn(() => true);
        expect(isA(Function, mockFn)).toBe(true);
    });

    test('should return true for regular functions when checking for Function', () => {
        function regularFn() {
            return true;
        }

        expect(isA(Function, regularFn)).toBe(true);
    });

    test('should return false for non-functions when checking for Function', () => {
        expect(isA(Function, {})).toBe(false);
        expect(isA(Function, 123)).toBe(false);
        expect(isA(Function, null)).toBe(false);
        expect(isA(Function, undefined)).toBe(false);
    });
});

describe('hasKey function', () => {
    test('should return true for own properties', () => {
        const obj = { a: 1, b: 2, c: undefined };

        expect(hasKey(obj, 'a')).toBe(true);
        expect(hasKey(obj, 'b')).toBe(true);
        expect(hasKey(obj, 'c')).toBe(true);
    });

    test('should return false for non-existent properties', () => {
        const obj = { a: 1, b: 2 };

        expect(hasKey(obj, 'c')).toBe(false);
        expect(hasKey(obj, 'toString')).toBe(true); // Inherited property
    });

    test('should work with array indices', () => {
        const arr = [ 1, 2, 3 ];

        expect(hasKey(arr, '0')).toBe(true);
        expect(hasKey(arr, '2')).toBe(true);
        expect(hasKey(arr, '3')).toBe(false);
    });

    test('should handle Symbol keys', () => {
        const sym = Symbol('testSymbol');
        const obj = { [sym]: 'symbol value' };

        expect(hasKey(obj, sym)).toBe(true);
        expect(hasKey(obj, Symbol('otherSymbol'))).toBe(false);
    });

    test('should work with objects that have null prototype', () => {
        const obj = Object.create(null);
        obj.a = 1;

        expect(hasKey(obj, 'a')).toBe(true);
        expect(hasKey(obj, 'b')).toBe(false);
    });

    test('should handle edge cases correctly', () => {
        expect(hasKey(null, 'a')).toBe(false); // Should not throw error on null
        expect(hasKey(undefined, 'a')).toBe(false); // Should not throw error on undefined

        const primitives = [ 42, 'string', true, Symbol('test') ];
        primitives.forEach(primitive => {
            expect(hasKey(primitive, 'toString')).toBe(false); // Inherited, not own
            expect(hasKey(primitive, 'nonexistent')).toBe(false);
        });
    });

    test('should return true for getter properties on prototype', () => {
        class Person {
            get name() {
                return 'John';
            }
        }

        const p = new Person();

        expect(hasKey(p, 'name')).toBe(true);
    });
});

describe('asymmetricMatch function', () => {
    test('should return true when asymmetric matcher matches value', () => {
        const matcher = new MockAsymmetricMatcher(42);
        expect(asymmetricMatch(matcher, 42)).toBe(true);
        expect(asymmetricMatch(42, matcher)).toBe(true);
    });

    test('should return false when asymmetric matcher does not match value', () => {
        const matcher = new MockAsymmetricMatcher(42);
        expect(asymmetricMatch(matcher, 43)).toBe(false);
        expect(asymmetricMatch(43, matcher)).toBe(false);
    });

    test('should return undefined when neither value is an asymmetric matcher', () => {
        expect(asymmetricMatch(42, 42)).toBeUndefined();
        expect(asymmetricMatch({}, [])).toBeUndefined();
    });

    test('should return undefined when both values are asymmetric matchers', () => {
        const matcher1 = new MockAsymmetricMatcher(42);
        const matcher2 = new MockAsymmetricMatcher(43);
        expect(asymmetricMatch(matcher1, matcher2)).toBeUndefined();
    });
});

describe('equals function', () => {
    test('should handle primitive types', () => {
        expect(equals(42, 42)).toBe(true);
        expect(equals('hello', 'hello')).toBe(true);
        expect(equals(true, true)).toBe(true);
        expect(equals(42, 43)).toBe(false);
        expect(equals('hello', 'world')).toBe(false);
    });

    test('should handle null and undefined', () => {
        expect(equals(null, null)).toBe(true);
        expect(equals(undefined, undefined)).toBe(true);
        expect(equals(null, undefined)).toBe(false);
    });

    test('should handle dates', () => {
        const date1 = new Date('2023-01-01');
        const date2 = new Date('2023-01-01');
        const date3 = new Date('2023-01-02');

        expect(equals(date1, date2)).toBe(true);
        expect(equals(date1, date3)).toBe(false);
    });

    test('should handle regular expressions', () => {
        expect(equals(/test/g, /test/g)).toBe(true);
        expect(equals(/test/g, /test/i)).toBe(false);
        expect(equals(/test/g, /other/g)).toBe(false);
    });

    test('should handle URLs', () => {
        const url1 = new URL('https://example.com/path');
        const url2 = new URL('https://example.com/path');
        const url3 = new URL('https://example.com/other');

        expect(equals(url1, url2)).toBe(true);
        expect(equals(url1, url3)).toBe(false);
    });

    test('should handle arrays', () => {
        expect(equals([ 1, 2, 3 ], [ 1, 2, 3 ])).toBe(true);
        expect(equals([ 1, 2, 3 ], [ 3, 2, 1 ])).toBe(false);
        expect(equals([ 1, 2, 3 ], [ 1, 2 ])).toBe(false);
        expect(equals([ 1, [ 2, 3 ]], [ 1, [ 2, 3 ]])).toBe(true);
    });

    test('should handle objects', () => {
        expect(equals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(equals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
        expect(equals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
        expect(equals({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } })).toBe(true);
    });

    test('equals handles partial vs strict array equality correctly', () => {
        const elementA = [ 1, 2, 3 ];
        const elementB = [ 1, 2 ];

        // Without strict mode
        expect(equals(elementA, elementB)).toBe(false);
        expect(equals(elementB, elementA)).toBe(false);
        expect(equals(elementB, elementA, false)).toBe(true);
    });

    test('should handle strict mode', () => {
        const matcher = new MockAsymmetricMatcher(42);

        // Without strict mode
        expect(equals(matcher, 42)).toBe(true);
        expect(equals(42, matcher)).toBe(true);
        expect(equals(matcher, 43)).toBe(false);

        // With strict mode
        expect(equals(matcher, 42, true)).toBe(true);
    });

    test('should handle different constructors', () => {
        class A {
            value = 1;
        }

        class B {
            value = 2;
        }

        expect(equals(new A(), new A())).toBe(true);
        expect(equals(new A(), new B())).toBe(false);
    });
});
