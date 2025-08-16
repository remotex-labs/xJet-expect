/**
 * Imports
 */

import { CloseToPattern } from '@patterns/close-to.pattern';

/**
 * Tests
 */

describe('CloseToPattern', () => {
    describe('create()', () => {
        test('creates an instance with given parameters', () => {
            const matcher = CloseToPattern.create(false, 3.14, 3);
            expect(matcher).toBeInstanceOf(CloseToPattern);
            expect(matcher.expected).toBe(3.14);
            expect(matcher.precision).toBe(3);
            expect(matcher.isInverse).toBe(false);
        });

        test('uses default precision 2 if not provided', () => {
            const matcher = CloseToPattern.create(false, 1.23);
            expect(matcher.precision).toBe(2);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label for normal match', () => {
            const matcher = CloseToPattern.create(false, 3.14, 2);
            expect(matcher.expectedLabel).toBe('CloseTo(3.14, 2 digits)');
        });

        test('returns correct label with singular digit and inversion', () => {
            const matcher = CloseToPattern.create(true, 1.5, 1);
            expect(matcher.expectedLabel).toBe('Not CloseTo(1.5, 1 digit)');
        });

        test('returns correct label with plural digits and inversion', () => {
            const matcher = CloseToPattern.create(true, 2.718, 3);
            expect(matcher.expectedLabel).toBe('Not CloseTo(2.718, 3 digits)');
        });
    });

    describe('matches()', () => {
        test('matches numbers within precision', () => {
            const matcher = CloseToPattern.create(false, 3.14, 2);

            expect(matcher.matches(3.142)).toBe(true);
            expect(matcher.matches(3.135)).toBe(false);
            expect(matcher.matches(3.145)).toBe(true);
            expect(matcher.matches(3.1351)).toBe(true);
        });

        test('does not match values outside precision', () => {
            const matcher = CloseToPattern.create(false, 3.14, 2);
            expect(matcher.matches(3.146)).toBe(false);
            expect(matcher.matches(3.10)).toBe(false);
        });

        test('returns false for non-number inputs', () => {
            const matcher = CloseToPattern.create(false, 3.14, 2);
            expect(matcher.matches('3.14')).toBe(false);
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches(undefined)).toBe(false);
            expect(matcher.matches({})).toBe(false);
        });

        test('applies inverse correctly', () => {
            const matcher = CloseToPattern.create(true, 3.14, 2);

            // When normally true, inverse returns false
            expect(matcher.matches(3.14)).toBe(false);
            expect(matcher.matches(3.141)).toBe(false);

            // When normally false, inverse returns true
            expect(matcher.matches(3.2)).toBe(true);
            expect(matcher.matches('3.14')).toBe(true);
        });

        test('returns false when value is not close enough within given precision', () => {
            const matcher = CloseToPattern.create(false, 0.3, 5);
            expect(matcher.matches(0.00005)).toBe(false);
        });
    });
});
