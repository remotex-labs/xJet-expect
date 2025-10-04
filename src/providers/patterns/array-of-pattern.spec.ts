/**
 * Imports
 */

import { ArrayOfPattern } from '@patterns/array-of.pattern';
import { equals, isAsymmetric } from '@components/object.component';

/**
 * Tests
 */

describe('ArrayOfPattern', () => {
    beforeEach(() => {
        xJet.clearAllMocks();
    });

    describe('create()', () => {
        test('creates an instance with given expected value and inversion flag', () => {
            const matcher = ArrayOfPattern.create(false, 42);
            expect(matcher).toBeInstanceOf(ArrayOfPattern);
        });

        test('throws TypeError if expected is undefined', () => {
            expect(() => ArrayOfPattern.create(false, undefined)).toThrow(TypeError);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label without inversion for string', () => {
            const matcher = ArrayOfPattern.create(false, 'test');
            expect(matcher.expectedLabel).toBe('ArrayOf( "test" )');
        });

        test('returns correct label without inversion for non-string', () => {
            const matcher = ArrayOfPattern.create(false, 123);
            expect(matcher.expectedLabel).toBe('ArrayOf( 123 )');
        });

        test('returns correct label with inversion', () => {
            const matcher = ArrayOfPattern.create(true, 'test');
            expect(matcher.expectedLabel).toBe('Not ArrayOf( "test" )');
        });

        test('returns expectedLabel from asymmetric matcher', () => {
            const asymmetric = { expectedLabel: 'AsymmetricLabel', matches: xJet.fn() };

            xJet.mock(isAsymmetric).mockImplementation((val) => val === asymmetric);

            const matcher = ArrayOfPattern.create(false, asymmetric);
            expect(matcher.expectedLabel).toContain('AsymmetricLabel');
        });
    });

    describe('matches()', () => {
        test('returns false when received is not an array', () => {
            const matcher = ArrayOfPattern.create(false, 1);
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches({})).toBe(false);
            expect(matcher.matches('string')).toBe(false);
        });

        test('returns true if every element matches expected value using equals', () => {
            const matcher = ArrayOfPattern.create(false, 42);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 42, 42, 42 ])).toBe(true);
            expect(matcher.matches([ 42, 41 ])).toBe(false);
            expect(matcher.matches([])).toBe(true); // every() on empty array returns true
        });

        test('returns false if any element does not match', () => {
            const matcher = ArrayOfPattern.create(false, 42);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 42, 43, 42 ])).toBe(false);
        });

        test('uses asymmetric matcher if expected is asymmetric', () => {
            const asymmetric = { matches: xJet.fn() };

            xJet.mock(isAsymmetric).mockImplementation((val) => val === asymmetric);
            xJet.mock(equals).mockReturnValue(false);

            asymmetric.matches.mockReturnValue(true);

            const matcher = ArrayOfPattern.create(false, asymmetric);
            expect(matcher.matches([ 123, 456 ])).toBe(true);

            asymmetric.matches.mockReturnValue(false);
            expect(matcher.matches([ 123, 456 ])).toBe(false);
        });

        test('applies inversion correctly', () => {
            const matcher = ArrayOfPattern.create(true, 42);

            xJet.mock(isAsymmetric).mockReturnValue(false);
            xJet.mock(equals).mockImplementation((a, b) => a === b);

            expect(matcher.matches([ 42, 42 ])).toBe(false); // normally true, inverted false
            expect(matcher.matches([ 42, 43 ])).toBe(true);  // normally false, inverted true
        });
    });
});
