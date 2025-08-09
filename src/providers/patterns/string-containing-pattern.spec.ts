/**
 * Imports
 */

import { StringContainingPattern } from '@patterns/string-containing.pattern';

/**
 * Tests
 */

describe('StringContainingPattern', () => {
    describe('create()', () => {
        test('creates an instance with given substring and inversion flag', () => {
            const matcher = StringContainingPattern.create(false, 'hello');
            expect(matcher).toBeInstanceOf(StringContainingPattern);
            expect(matcher.expected).toBe('hello');
            expect(matcher.isInverse).toBe(false);
        });

        test('throws TypeError if expected is not a string', () => {
            // @ts-expect-error testing invalid input
            expect(() => StringContainingPattern.create(false, 123)).toThrow(TypeError);
            expect(() => StringContainingPattern.create(false, <any> null)).toThrow(TypeError);
            expect(() => StringContainingPattern.create(false, <any> undefined)).toThrow(TypeError);
            expect(() => StringContainingPattern.create(false, {} as any)).toThrow(TypeError);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label without inversion', () => {
            const matcher = StringContainingPattern.create(false, 'test');
            expect(matcher.expectedLabel).toBe('stringContaining("test")');
        });

        test('returns correct label with inversion', () => {
            const matcher = StringContainingPattern.create(true, 'test');
            expect(matcher.expectedLabel).toBe('Not stringContaining("test")');
        });
    });

    describe('matches()', () => {
        test('returns true if received string contains expected substring', () => {
            const matcher = StringContainingPattern.create(false, 'hello');
            expect(matcher.matches('hello world')).toBe(true);
            expect(matcher.matches('say hello')).toBe(true);
            expect(matcher.matches('HELLO')).toBe(false); // case sensitive
            expect(matcher.matches('world')).toBe(false);
        });

        test('returns false if received value is not a string', () => {
            const matcher = StringContainingPattern.create(false, 'hello');
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches(undefined)).toBe(false);
            expect(matcher.matches(123)).toBe(false);
            expect(matcher.matches({})).toBe(false);
        });

        test('inverts the match result when isInverse is true', () => {
            const matcher = StringContainingPattern.create(true, 'hello');
            expect(matcher.matches('hello world')).toBe(false);
            expect(matcher.matches('world')).toBe(true);
            expect(matcher.matches('HELLO')).toBe(true);
            expect(matcher.matches(null)).toBe(true);
        });
    });
});
