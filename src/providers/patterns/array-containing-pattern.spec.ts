/**
 * Imports
 */

import { equals, isAsymmetric } from '@components/object.component';
import { ArrayContainingPattern } from '@patterns/array-containing.pattern';

/**
 * Tests
 */

describe('ArrayContainingPattern', () => {
    beforeEach(() => {
        xJet.clearAllMocks();
    });

    describe('create()', () => {
        test('creates an instance with given array and inversion flag', () => {
            const matcher = ArrayContainingPattern.create(false, [ 1, 2, 3 ]);
            expect(matcher).toBeInstanceOf(ArrayContainingPattern);
        });

        test('throws TypeError if expected is not an array', () => {
            expect(() => ArrayContainingPattern.create(false, <any>'not array')).toThrow(TypeError);
            expect(() => ArrayContainingPattern.create(false, <any>null)).toThrow(TypeError);
            expect(() => ArrayContainingPattern.create(false, <any>{})).toThrow(TypeError);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label without inversion', () => {
            const matcher = ArrayContainingPattern.create(false, [ 1, 2 ]);
            // Default serialize returns a string joined by space — this may vary by your serialize implementation
            expect(matcher.expectedLabel).toContain('ArrayContaining');
            expect(matcher.expectedLabel).toContain('1');
            expect(matcher.expectedLabel).toContain('2');
            expect(matcher.expectedLabel.startsWith('Not')).toBe(false);
        });

        test('returns correct label with inversion', () => {
            const matcher = ArrayContainingPattern.create(true, [ 1 ]);
            expect(matcher.expectedLabel.startsWith('Not')).toBe(true);
            expect(matcher.expectedLabel).toContain('ArrayContaining');
            expect(matcher.expectedLabel).toContain('1');
        });

        test('returns expectedLabel from asymmetric matcher', () => {
            // Setup a fake asymmetric matcher with expectedLabel
            const asymmetric = { expectedLabel: 'AsymmetricLabel', matches: xJet.fn() };

            xJet.mock(isAsymmetric).mockImplementation((val) => val === asymmetric);

            const matcher = ArrayContainingPattern.create(false, [ asymmetric ]);
            expect(matcher.expectedLabel).toContain('AsymmetricLabel');
        });
    });

    describe('matches()', () => {
        test('returns false when received is not an array', () => {
            const matcher = ArrayContainingPattern.create(false, [ 1, 2 ]);
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches({})).toBe(false);
            expect(matcher.matches('string')).toBe(false);
        });

        test('returns true if all expected elements are contained (using equals)', () => {
            const matcher = ArrayContainingPattern.create(false, [ 1, 2 ]);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 1, 2, 3 ])).toBe(true);
            expect(matcher.matches([ 2, 1 ])).toBe(true);
            expect(matcher.matches([ 1 ])).toBe(false);
        });

        test('returns false if any expected element not found', () => {
            const matcher = ArrayContainingPattern.create(false, [ 1, 2, 4 ]);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 1, 2, 3 ])).toBe(false);
        });

        test('uses asymmetric matcher when expected element is asymmetric', () => {
            const asymmetric = { matches: xJet.fn() };
            xJet.mock(isAsymmetric).mockImplementation((val) => val === asymmetric);
            xJet.mock(equals).mockReturnValue(false);

            asymmetric.matches.mockReturnValue(true);

            const matcher = ArrayContainingPattern.create(false, [ asymmetric ]);
            expect(matcher.matches([ 123 ])).toBe(true);

            asymmetric.matches.mockReturnValue(false);
            expect(matcher.matches([ 456 ])).toBe(false);
        });

        test('applies inversion correctly', () => {
            const matcher = ArrayContainingPattern.create(true, [ 1 ]);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 1, 2, 3 ])).toBe(false); // normally true, inverted false
            expect(matcher.matches([ 2, 3 ])).toBe(true); // normally false, inverted true
        });
    });
});
