/**
 * Imports
 */

import { AnyPattern } from '@patterns/any.pattern';

/**
 * Tests
 */

describe('AnyPattern', () => {
    describe('create()', () => {
        test('throws TypeError if called with undefined', () => {
            expect(() => AnyPattern.create(<any>undefined)).toThrow(TypeError);
        });

        test('creates an instance with the expected constructor', () => {
            const matcher = AnyPattern.create(Number);
            expect(matcher).toBeInstanceOf(AnyPattern);
            expect(matcher.expected).toBe(Number);
        });
    });

    describe('expectedLabel', () => {
        test('returns the expected label string', () => {
            const matcher = AnyPattern.create(String);
            expect(matcher.expectedLabel).toBe('Any<String>');
        });

        test('returns correct expectedLabel for all tested constructors', () => {
            const constructors = [
                String,
                Number,
                Boolean,
                Function,
                BigInt,
                Symbol,
                Array,
                Object,
                class {
                },
                class MyClass {
                    name = 'MyClass';
                }
            ];

            constructors.forEach((ctor) => {
                const matcher = AnyPattern.create(ctor);
                const expectedName = ctor.name || 'Anonymous';
                expect(matcher.expectedLabel).toBe(`Any<${ expectedName }>`);
            });
        });
    });

    describe('matches()', () => {
        test('correctly matches primitive types and their wrappers', () => {
            const stringMatcher = AnyPattern.create(String);
            expect(stringMatcher.matches('hello')).toBe(true);
            expect(stringMatcher.matches(new String('hello'))).toBe(true);
            expect(stringMatcher.matches(123)).toBe(false);

            const numberMatcher = AnyPattern.create(Number);
            expect(numberMatcher.matches(123)).toBe(true);
            expect(numberMatcher.matches(new Number(123))).toBe(true);
            expect(numberMatcher.matches('123')).toBe(false);

            const booleanMatcher = AnyPattern.create(Boolean);
            expect(booleanMatcher.matches(true)).toBe(true);
            expect(booleanMatcher.matches(new Boolean(false))).toBe(true);
            expect(booleanMatcher.matches(0)).toBe(false);

            const functionMatcher = AnyPattern.create(Function);
            expect(functionMatcher.matches(() => {
            })).toBe(true);
            expect(functionMatcher.matches(function () {
            })).toBe(true);
            expect(functionMatcher.matches({})).toBe(false);

            const bigIntMatcher = AnyPattern.create(BigInt);
            expect(bigIntMatcher.matches(BigInt(123))).toBe(true);
            expect(bigIntMatcher.matches(123n)).toBe(true);
            expect(bigIntMatcher.matches(123)).toBe(false);

            const symbolMatcher = AnyPattern.create(Symbol);
            expect(symbolMatcher.matches(Symbol())).toBe(true);
            expect(symbolMatcher.matches('symbol')).toBe(false);
        });

        test('correctly matches arrays', () => {
            const arrayMatcher = AnyPattern.create(Array);
            expect(arrayMatcher.matches([])).toBe(true);
            expect(arrayMatcher.matches([ 1, 2, 3 ])).toBe(true);
            expect(arrayMatcher.matches({ length: 0 })).toBe(false);
        });

        test('correctly matches objects', () => {
            const objectMatcher = AnyPattern.create(Object);
            expect(objectMatcher.matches({})).toBe(true);
            expect(objectMatcher.matches(null)).toBe(true);
            expect(objectMatcher.matches([])).toBe(true); // arrays are objects in JS
        });

        test('falls back to instanceof for other constructors', () => {
            class MyClass {
            }

            const matcher = AnyPattern.create(MyClass);

            expect(matcher.matches(new MyClass())).toBe(true);
            expect(matcher.matches({})).toBe(false);
            expect(matcher.matches(null)).toBe(false);
        });
    });
});
