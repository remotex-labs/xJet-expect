/**
 * Imports
 */

import { StringMatchingPattern } from '@patterns/string-matching.pattern';

/**
 * Tests
 */

describe('StringMatchingPattern', () => {
    describe('create()', () => {
        test('creates instance with string expected value', () => {
            const matcher = StringMatchingPattern.create(false, 'hello');
            expect(matcher).toBeInstanceOf(StringMatchingPattern);
        });

        test('creates instance with RegExp expected value', () => {
            const matcher = StringMatchingPattern.create(true, /world$/);
            expect(matcher).toBeInstanceOf(StringMatchingPattern);
        });

        test('throws TypeError if expected is undefined or null', () => {
            expect(() => StringMatchingPattern.create(false, <any>undefined)).toThrow(TypeError);
            expect(() => StringMatchingPattern.create(false, <any>null)).toThrow(TypeError);
        });

        test('throws TypeError if expected is not string or RegExp', () => {
            expect(() => StringMatchingPattern.create(false, <any>42)).toThrow(TypeError);
            expect(() => StringMatchingPattern.create(false, <any>{})).toThrow(TypeError);
            expect(() => StringMatchingPattern.create(false, <any>true)).toThrow(TypeError);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label for string expected without inversion', () => {
            const matcher = StringMatchingPattern.create(false, 'foo');
            expect(matcher.expectedLabel).toBe('stringMatching("foo")');
        });

        test('returns correct label for string expected with inversion', () => {
            const matcher = StringMatchingPattern.create(true, 'bar');
            expect(matcher.expectedLabel).toBe('Not stringMatching("bar")');
        });

        test('returns correct label for RegExp expected without inversion', () => {
            const matcher = StringMatchingPattern.create(false, /baz/);
            expect(matcher.expectedLabel).toBe('stringMatching(/baz/)');
        });

        test('returns correct label for RegExp expected with inversion', () => {
            const matcher = StringMatchingPattern.create(true, /^qux$/);
            expect(matcher.expectedLabel).toBe('Not stringMatching(/^qux$/)');
        });
    });

    describe('matches()', () => {
        test('returns false if received is not a string', () => {
            const matcher = StringMatchingPattern.create(false, 'foo');
            expect(matcher.matches(123)).toBe(false);
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches(undefined)).toBe(false);
            expect(matcher.matches({})).toBe(false);
        });

        test('matches string inclusion correctly', () => {
            const matcher = StringMatchingPattern.create(false, 'hello');
            expect(matcher.matches('hello world')).toBe(true);
            expect(matcher.matches('say hello')).toBe(true);
            expect(matcher.matches('HELLO')).toBe(false);
            expect(matcher.matches('')).toBe(false);
        });

        test('matches RegExp correctly', () => {
            const matcher = StringMatchingPattern.create(false, /world$/);
            expect(matcher.matches('hello world')).toBe(true);
            expect(matcher.matches('world')).toBe(true);
            expect(matcher.matches('worldwide')).toBe(false);
        });

        test('applies inversion correctly with string expected', () => {
            const matcher = StringMatchingPattern.create(true, 'hello');
            expect(matcher.matches('hello world')).toBe(false);
            expect(matcher.matches('no match')).toBe(true);
        });

        test('applies inversion correctly with RegExp expected', () => {
            const matcher = StringMatchingPattern.create(true, /^foo$/);
            expect(matcher.matches('foo')).toBe(false);
            expect(matcher.matches('foobar')).toBe(true);
        });
    });
});
