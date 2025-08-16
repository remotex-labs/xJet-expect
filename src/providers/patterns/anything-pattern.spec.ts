/**
 * Imports
 */

import { AnythingPattern } from '@patterns/anything.pattern';

/**
 * Tests
 */

describe('AnythingPattern', () => {
    describe('create()', () => {
        test('creates an instance of AnythingPattern', () => {
            const matcher = AnythingPattern.create();
            expect(matcher).toBeInstanceOf(AnythingPattern);
        });
    });

    describe('expectedLabel', () => {
        test('returns "Anything"', () => {
            const matcher = AnythingPattern.create();
            expect(matcher.expectedLabel).toBe('Anything');
        });
    });

    describe('matches()', () => {
        test('returns false for null and undefined', () => {
            const matcher = AnythingPattern.create();
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches(undefined)).toBe(false);
        });

        test('returns true for all other values', () => {
            const matcher = AnythingPattern.create();

            expect(matcher.matches(0)).toBe(true);
            expect(matcher.matches('')).toBe(true);
            expect(matcher.matches(false)).toBe(true);
            expect(matcher.matches({})).toBe(true);
            expect(matcher.matches([])).toBe(true);
            expect(matcher.matches(() => {})).toBe(true);
            expect(matcher.matches(Symbol())).toBe(true);
            expect(matcher.matches(BigInt(123))).toBe(true);
        });
    });
});
