/**
 * Imports
 */

import { equals, isAsymmetric, hasKey } from '@components/object.component';
import { ObjectContainingPattern } from '@patterns/object-containing.pattern';

/**
 * Mock dependencies
 */

jest.mock('@components/object.component', () => ({
    equals: jest.fn(),
    hasKey: jest.fn(),
    isAsymmetric: jest.fn()
}));

/**
 * Tests
 */

describe('ObjectContainingPattern', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('create()', () => {
        test('creates an instance with given expected object and inversion flag', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar' });
            expect(matcher).toBeInstanceOf(ObjectContainingPattern);
        });

        test('throws TypeError if expected is not a plain object', () => {
            expect(() => ObjectContainingPattern.create(false, <any>null)).toThrow(TypeError);
            expect(() => ObjectContainingPattern.create(false, <any>[])).toThrow(TypeError);
            expect(() => ObjectContainingPattern.create(false, <any>'string')).toThrow(TypeError);
            expect(() => ObjectContainingPattern.create(false, <any>42)).toThrow(TypeError);
        });
    });

    describe('expectedLabel', () => {
        test('returns correct label without inversion', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar' });
            expect(matcher.expectedLabel).toContain('ObjectContaining');
            expect(matcher.expectedLabel).toContain('foo');
            expect(matcher.expectedLabel).toContain('bar');
            expect(matcher.expectedLabel.startsWith('Not')).toBe(false);
        });

        test('returns correct label with inversion', () => {
            const matcher = ObjectContainingPattern.create(true, { foo: 'bar' });
            expect(matcher.expectedLabel.startsWith('Not')).toBe(true);
            expect(matcher.expectedLabel).toContain('ObjectContaining');
            expect(matcher.expectedLabel).toContain('foo');
            expect(matcher.expectedLabel).toContain('bar');
        });

        test('returns expectedLabel from asymmetric matcher', () => {
            const asymmetric = { expectedLabel: 'AsymmetricLabel', matches: jest.fn() };
            (isAsymmetric as unknown as jest.Mock).mockImplementation((val) => val === asymmetric);

            const matcher = ObjectContainingPattern.create(false, { key: asymmetric });
            expect(matcher.expectedLabel).toContain('AsymmetricLabel');
        });
    });

    describe('matches()', () => {
        test('returns false when received is not an object', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar' });
            expect(matcher.matches(null)).toBe(false);
            expect(matcher.matches('string')).toBe(false);
            expect(matcher.matches(42)).toBe(false);
        });

        test('returns false when hasKey returns false for any expected key', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar', baz: 42 });

            (hasKey as jest.Mock).mockImplementation((obj, key) => key !== 'baz');
            (equals as jest.Mock).mockImplementation((a, b) => a === b);

            expect(matcher.matches({ foo: 'bar' })).toBe(false);
            expect(hasKey).toHaveBeenCalledWith(expect.any(Object), 'foo');
            expect(hasKey).toHaveBeenCalledWith(expect.any(Object), 'baz');
        });

        test('returns true if all expected keys exist and values match (using equals)', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar', baz: 42 });

            (hasKey as jest.Mock).mockReturnValue(true);
            (isAsymmetric as unknown as jest.Mock).mockReturnValue(false);
            (equals as jest.Mock).mockImplementation((a, b) => a === b);

            const received = { foo: 'bar', baz: 42, extra: 'value' };
            expect(matcher.matches(received)).toBe(true);
        });

        test('returns false if any value does not match', () => {
            const matcher = ObjectContainingPattern.create(false, { foo: 'bar', baz: 42 });

            (hasKey as jest.Mock).mockReturnValue(true);
            (isAsymmetric as unknown as jest.Mock).mockReturnValue(false);
            (equals as jest.Mock).mockImplementation((a, b) => a === b);

            const received = { foo: 'bar', baz: 43 };
            expect(matcher.matches(received)).toBe(false);
        });

        test('uses asymmetric matcher when expected value is asymmetric', () => {
            const asymmetric = { matches: jest.fn() };

            (hasKey as jest.Mock).mockReturnValue(true);
            (isAsymmetric as unknown as jest.Mock).mockImplementation((val) => val === asymmetric);
            (equals as jest.Mock).mockReturnValue(false);

            asymmetric.matches.mockReturnValue(true);

            const matcher = ObjectContainingPattern.create(false, { key: asymmetric });
            const received = { key: 'some value' };

            expect(matcher.matches(received)).toBe(true);

            asymmetric.matches.mockReturnValue(false);
            expect(matcher.matches(received)).toBe(false);
        });

        test('applies inversion correctly', () => {
            const matcher = ObjectContainingPattern.create(true, { foo: 'bar' });

            (hasKey as jest.Mock).mockReturnValue(true);
            (isAsymmetric as unknown as jest.Mock).mockReturnValue(false);
            (equals as jest.Mock).mockImplementation((a, b) => a === b);

            expect(matcher.matches({ foo: 'bar' })).toBe(false); // normally true, inverted false
            expect(matcher.matches({ foo: 'baz' })).toBe(true);  // normally false, inverted true
        });
    });
});
