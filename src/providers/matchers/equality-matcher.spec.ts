/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetExpectError } from '@errors/expect.error';
import { toBe, toBeDefined, toBeFalsy, toBeNaN } from '@matchers/equality.matcher';
import { toBeNull, toBeTruthy, toBeUndefined, toEqual } from '@matchers/equality.matcher';

/**
 * CreateMatcherService
 */

function createMatcherService(received: unknown, notModifier = false) {
    return {
        received,
        notModifier,
        assertionChain: [ 'toBe' ]
    } as unknown as MatcherService;
}

/**
 * Tests
 */

describe('toBe matcher - edge cases', () => {
    // Primitive strict equality tests
    test('passes for equal numbers', () => {
        expect(() => toBe.call(createMatcherService(5), 5)).not.toThrow();
    });

    test('throws for different numbers', () => {
        expect(() => toBe.call(createMatcherService(5), 6)).toThrow(xJetExpectError);
    });

    test('passes for equal strings', () => {
        expect(() => toBe.call(createMatcherService('foo'), 'foo')).not.toThrow();
    });

    test('throws for different strings', () => {
        expect(() => toBe.call(createMatcherService('foo'), 'bar')).toThrow(xJetExpectError);
    });

    test('passes for true boolean', () => {
        expect(() => toBe.call(createMatcherService(true), true)).not.toThrow();
    });

    test('throws for different boolean', () => {
        expect(() => toBe.call(createMatcherService(true), false)).toThrow(xJetExpectError);
    });

    // Special values
    test('passes for NaN compared to NaN (Object.is)', () => {
        expect(() => toBe.call(createMatcherService(NaN), NaN)).not.toThrow();
    });

    test('throws for -0 vs +0', () => {
        expect(() => toBe.call(createMatcherService(-0), +0)).toThrow(xJetExpectError);
    });

    test('passes for null compared to null', () => {
        expect(() => toBe.call(createMatcherService(null), null)).not.toThrow();
    });

    test('throws for null vs undefined', () => {
        expect(() => toBe.call(createMatcherService(null), undefined)).toThrow(xJetExpectError);
    });

    test('throws for undefined vs null', () => {
        expect(() => toBe.call(createMatcherService(undefined), null)).toThrow(xJetExpectError);
    });

    test('passes for undefined vs undefined', () => {
        expect(() => toBe.call(createMatcherService(undefined), undefined)).not.toThrow();
    });

    test('throws with note if deep equal but not strict equal', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };

        try {
            toBe.call(createMatcherService(obj1), obj2);
            throw new Error('Expected to throw');
        } catch (e: any) {
            expect(e).toBeInstanceOf(xJetExpectError);
            expect(e.message).toMatch(/replace "toBe" with "toEqual"/);
        }
    });

    test('throws without note if deep not equal', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 2 };

        try {
            toBe.call(createMatcherService(obj1), obj2);
            throw new Error('Expected to throw');
        } catch (e: any) {
            expect(e).toBeInstanceOf(xJetExpectError);
            expect(e.message).not.toMatch(/replace "toBe" with "toEqual"/);
        }
    });

    test('passes when asymmetric matcher matches', () => {
        const asymmetric = {
            expectedLabel: 'custom',
            matches: xJet.fn(() => true)
        };

        expect(() => toBe.call(createMatcherService('foo'), asymmetric)).not.toThrow();
        expect(asymmetric.matches).toHaveBeenCalledWith('foo');
    });

    test('throws when asymmetric matcher does not match', () => {
        const asymmetric = {
            expectedLabel: 'custom',
            matches: xJet.fn(() => false)
        };

        try {
            toBe.call(createMatcherService('foo'), asymmetric);
            throw new Error('Expected to throw');
        } catch (e) {
            expect(e).toBeInstanceOf(xJetExpectError);
            expect(asymmetric.matches).toHaveBeenCalledWith('foo');
        }
    });

    // with notModifier = true, invert throw behavior
    test('does not throw when notModifier true and pass is false', () => {
        const ms = createMatcherService(1, true);
        expect(() => toBe.call(ms, 2)).not.toThrow();
    });

    test('throws when notModifier true and pass is true', () => {
        const ms = createMatcherService(1, true);
        expect(() => toBe.call(ms, 1)).toThrow(xJetExpectError);
    });

    // Complex types equal
    test('passes for equal Date objects', () => {
        const d1 = new Date(2022, 1, 1);
        expect(() => toBe.call(createMatcherService(d1), d1)).not.toThrow();
    });

    test('throws for different Date objects', () => {
        const d1 = new Date(2022, 1, 1);
        const d2 = new Date(2023, 1, 1);

        expect(() => toBe.call(createMatcherService(d1), d2)).toThrow(xJetExpectError);
    });

    test('passes for equal RegExp objects', () => {
        const r1 = /abc/i;
        expect(() => toBe.call(createMatcherService(r1), r1)).not.toThrow();
    });

    test('throws for different RegExp objects', () => {
        const r1 = /abc/i;
        const r2 = /abc/g;

        expect(() => toBe.call(createMatcherService(r1), r2)).toThrow(xJetExpectError);
    });
});

describe('toEqual matcher - edge cases', () => {
    function createMatcherServiceToEqual(received: unknown, notModifier = false) {
        return {
            received,
            notModifier,
            assertionChain: [ 'toEqual' ]
        } as unknown as MatcherService;
    }

    test('passes for deeply equal objects', () => {
        const obj1 = { a: 1, b: { c: 2 } };
        const obj2 = { a: 1, b: { c: 2 } };
        expect(() => toEqual.call(createMatcherServiceToEqual(obj1), obj2)).not.toThrow();
    });

    test('throws for deeply different objects', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 2 };
        expect(() => toEqual.call(createMatcherServiceToEqual(obj1), obj2)).toThrow(xJetExpectError);
    });

    test('passes for equal primitives', () => {
        expect(() => toEqual.call(createMatcherServiceToEqual(5), 5)).not.toThrow();
        expect(() => toEqual.call(createMatcherServiceToEqual('foo'), 'foo')).not.toThrow();
    });

    test('throws for different primitives', () => {
        expect(() => toEqual.call(createMatcherServiceToEqual(5), 6)).toThrow(xJetExpectError);
        expect(() => toEqual.call(createMatcherServiceToEqual('foo'), 'bar')).toThrow(xJetExpectError);
    });

    test('passes for arrays with same contents', () => {
        const arr1 = [ 1, 2, 3 ];
        const arr2 = [ 1, 2, 3 ];
        expect(() => toEqual.call(createMatcherServiceToEqual(arr1), arr2)).not.toThrow();
    });

    test('throws for arrays with different contents', () => {
        const arr1 = [ 1, 2, 3 ];
        const arr2 = [ 1, 2, 4 ];
        expect(() => toEqual.call(createMatcherServiceToEqual(arr1), arr2)).toThrow(xJetExpectError);
    });

    test('passes for nested arrays and objects', () => {
        const val1 = { a: [{ b: 2 }] };
        const val2 = { a: [{ b: 2 }] };
        expect(() => toEqual.call(createMatcherServiceToEqual(val1), val2)).not.toThrow();
    });

    test('throws for nested arrays and objects with differences', () => {
        const val1 = { a: [{ b: 2 }] };
        const val2 = { a: [{ b: 3 }] };
        expect(() => toEqual.call(createMatcherServiceToEqual(val1), val2)).toThrow(xJetExpectError);
    });
});

describe('toBeNull matcher', () => {
    test('passes when received is null', () => {
        expect(() => toBeNull.call(createMatcherService(null))).not.toThrow();
    });

    test('throws when received is undefined', () => {
        expect(() => toBeNull.call(createMatcherService(undefined))).toThrow(xJetExpectError);
    });

    test('throws when received is 0', () => {
        expect(() => toBeNull.call(createMatcherService(0))).toThrow(xJetExpectError);
    });

    test('throws when received is empty string', () => {
        expect(() => toBeNull.call(createMatcherService(''))).toThrow(xJetExpectError);
    });

    test('throws when received is false', () => {
        expect(() => toBeNull.call(createMatcherService(false))).toThrow(xJetExpectError);
    });

    test('throws when received is an object', () => {
        expect(() => toBeNull.call(createMatcherService({}))).toThrow(xJetExpectError);
    });

    // Test notModifier inversion if applicable
    test('does not throw when notModifier true and received is not null', () => {
        const ms = createMatcherService(123, true);
        expect(() => toBeNull.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and received is null', () => {
        const ms = createMatcherService(null, true);
        expect(() => toBeNull.call(ms)).toThrow(xJetExpectError);
    });
});

describe('toBeUndefined matcher', () => {
    test('passes when received is undefined', () => {
        expect(() => toBeUndefined.call(createMatcherService(undefined))).not.toThrow();
    });

    test('throws when received is null', () => {
        expect(() => toBeUndefined.call(createMatcherService(null))).toThrow(xJetExpectError);
    });

    test('throws when received is 0', () => {
        expect(() => toBeUndefined.call(createMatcherService(0))).toThrow(xJetExpectError);
    });

    test('throws when received is empty string', () => {
        expect(() => toBeUndefined.call(createMatcherService(''))).toThrow(xJetExpectError);
    });

    test('throws when received is false', () => {
        expect(() => toBeUndefined.call(createMatcherService(false))).toThrow(xJetExpectError);
    });

    test('throws when received is an object', () => {
        expect(() => toBeUndefined.call(createMatcherService({}))).toThrow(xJetExpectError);
    });

    // Test notModifier inversion if applicable
    test('does not throw when notModifier true and received is not undefined', () => {
        const ms = createMatcherService(123, true);
        expect(() => toBeUndefined.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and received is undefined', () => {
        const ms = createMatcherService(undefined, true);
        expect(() => toBeUndefined.call(ms)).toThrow(xJetExpectError);
    });
});

describe('toBeNaN matcher', () => {
    test('passes when received is NaN', () => {
        expect(() => toBeNaN.call(createMatcherService(NaN))).not.toThrow();
    });

    test('throws when received is a number (not NaN)', () => {
        expect(() => toBeNaN.call(createMatcherService(123))).toThrow(xJetExpectError);
        expect(() => toBeNaN.call(createMatcherService(0))).toThrow(xJetExpectError);
        expect(() => toBeNaN.call(createMatcherService(-1))).toThrow(xJetExpectError);
    });

    test('throws when received is undefined', () => {
        expect(() => toBeNaN.call(createMatcherService(undefined))).toThrow(xJetExpectError);
    });

    test('throws when received is null', () => {
        expect(() => toBeNaN.call(createMatcherService(null))).toThrow(xJetExpectError);
    });

    test('throws when received is a string', () => {
        expect(() => toBeNaN.call(createMatcherService('NaN'))).toThrow(xJetExpectError);
    });

    test('throws when received is an object', () => {
        expect(() => toBeNaN.call(createMatcherService({}))).toThrow(xJetExpectError);
    });

    // Test notModifier inversion behavior if applicable
    test('does not throw when notModifier true and received is not NaN', () => {
        const ms = createMatcherService(42, true);
        expect(() => toBeNaN.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and received is NaN', () => {
        const ms = createMatcherService(NaN, true);
        expect(() => toBeNaN.call(ms)).toThrow(xJetExpectError);
    });
});

describe('toBeTruthy matcher', () => {
    test('passes for truthy values', () => {
        expect(() => toBeTruthy.call(createMatcherService(true))).not.toThrow();
        expect(() => toBeTruthy.call(createMatcherService(1))).not.toThrow();
        expect(() => toBeTruthy.call(createMatcherService('non-empty'))).not.toThrow();
        expect(() => toBeTruthy.call(createMatcherService({}))).not.toThrow();
        expect(() => toBeTruthy.call(createMatcherService([]))).not.toThrow();
        expect(() => toBeTruthy.call(createMatcherService(() => {}))).not.toThrow();
    });

    test('throws for falsy values', () => {
        expect(() => toBeTruthy.call(createMatcherService(false))).toThrow(xJetExpectError);
        expect(() => toBeTruthy.call(createMatcherService(0))).toThrow(xJetExpectError);
        expect(() => toBeTruthy.call(createMatcherService(''))).toThrow(xJetExpectError);
        expect(() => toBeTruthy.call(createMatcherService(null))).toThrow(xJetExpectError);
        expect(() => toBeTruthy.call(createMatcherService(undefined))).toThrow(xJetExpectError);
        expect(() => toBeTruthy.call(createMatcherService(NaN))).toThrow(xJetExpectError);
    });

    // Test notModifier inversion behavior if applicable
    test('does not throw when notModifier true and value is falsy', () => {
        const ms = createMatcherService(false, true);
        expect(() => toBeTruthy.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and value is truthy', () => {
        const ms = createMatcherService(true, true);
        expect(() => toBeTruthy.call(ms)).toThrow(xJetExpectError);
    });
});

describe('toBeFalsy matcher', () => {
    test('passes for falsy values', () => {
        expect(() => toBeFalsy.call(createMatcherService(false))).not.toThrow();
        expect(() => toBeFalsy.call(createMatcherService(0))).not.toThrow();
        expect(() => toBeFalsy.call(createMatcherService(''))).not.toThrow();
        expect(() => toBeFalsy.call(createMatcherService(null))).not.toThrow();
        expect(() => toBeFalsy.call(createMatcherService(undefined))).not.toThrow();
        expect(() => toBeFalsy.call(createMatcherService(NaN))).not.toThrow();
    });

    test('throws for truthy values', () => {
        expect(() => toBeFalsy.call(createMatcherService(true))).toThrow(xJetExpectError);
        expect(() => toBeFalsy.call(createMatcherService(1))).toThrow(xJetExpectError);
        expect(() => toBeFalsy.call(createMatcherService('non-empty'))).toThrow(xJetExpectError);
        expect(() => toBeFalsy.call(createMatcherService({}))).toThrow(xJetExpectError);
        expect(() => toBeFalsy.call(createMatcherService([]))).toThrow(xJetExpectError);
        expect(() => toBeFalsy.call(createMatcherService(() => {}))).toThrow(xJetExpectError);
    });

    // Test notModifier inversion behavior if applicable
    test('does not throw when notModifier true and value is truthy', () => {
        const ms = createMatcherService(true, true);
        expect(() => toBeFalsy.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and value is falsy', () => {
        const ms = createMatcherService(false, true);
        expect(() => toBeFalsy.call(ms)).toThrow(xJetExpectError);
    });
});

describe('toBeDefined matcher', () => {
    test('passes when value is defined', () => {
        expect(() => toBeDefined.call(createMatcherService(0))).not.toThrow();
        expect(() => toBeDefined.call(createMatcherService(''))).not.toThrow();
        expect(() => toBeDefined.call(createMatcherService(false))).not.toThrow();
        expect(() => toBeDefined.call(createMatcherService(null))).not.toThrow();
        expect(() => toBeDefined.call(createMatcherService({}))).not.toThrow();
        expect(() => toBeDefined.call(createMatcherService([]))).not.toThrow();
    });

    test('throws when value is undefined', () => {
        expect(() => toBeDefined.call(createMatcherService(undefined))).toThrow(xJetExpectError);
    });

    // with notModifier true, invert throw behavior
    test('does not throw when notModifier true and value is undefined', () => {
        const ms = createMatcherService(undefined, true);
        expect(() => toBeDefined.call(ms)).not.toThrow();
    });

    test('throws when notModifier true and value is defined', () => {
        const ms = createMatcherService(123, true);
        expect(() => toBeDefined.call(ms)).toThrow(xJetExpectError);
    });
});
