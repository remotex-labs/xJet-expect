/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { NumericType } from '@matchers/interfaces/number-matcher.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { xJetExpectError } from '@errors/expect.error';
import { toBeCloseTo, toBeGreaterThan } from '@matchers/number.matcher';
import { toBeGreaterThanOrEqual, toBeLessThan, toBeLessThanOrEqual } from '@matchers/number.matcher';

/**
 * CreateMatcherService
 */

function createMatcher(received: unknown, notModifier = false, assertionChain: Array<string> = [ 'test' ]): MatcherService<number> {
    return {
        received,
        notModifier,
        assertionChain
    } as unknown as MatcherService<number>;
}

/**
 * Tests
 */

describe('toBeCloseTo', () => {
    test('passes when numbers are close within default precision (2)', () => {
        const ms = createMatcher(0.2 + 0.1);
        expect(() => toBeCloseTo.call(ms, 0.3)).not.toThrow();
    });

    test('throws when numbers are not close within given precision', () => {
        const ms = createMatcher(0.2 + 0.1);
        expect(() => toBeCloseTo.call(ms, 0.3, 16)).toThrow(xJetExpectError);
        expect(() => toBeCloseTo.call(ms, 0.3, 15)).not.toThrow();
    });

    test('throws xJetTypeError if expected is not a number', () => {
        const ms = createMatcher(0.3);
        expect(() => toBeCloseTo.call(ms, 'not a number' as any)).toThrow(xJetTypeError);
    });

    test('throws xJetTypeError if received is not a number', () => {
        const ms = createMatcher('not a number' as any);
        expect(() => toBeCloseTo.call(ms, 0.3)).toThrow(xJetTypeError);
    });

    test('inverts throw behavior when notModifier is true', () => {
        // receivedDifference < expectedDifference is false -> pass normally false, but inverted pass -> true => no throw
        const ms = createMatcher(0.00005, true);
        expect(() => toBeCloseTo.call(ms, 0.3, 5)).not.toThrow();

        // receivedDifference < expectedDifference is true -> pass normally true, inverted pass -> false => throw
        const ms2 = createMatcher(0.3, true);
        expect(() => toBeCloseTo.call(ms2, 0.3, 5)).toThrow(xJetExpectError);
    });

    test('handles edge cases around precision boundaries', () => {
        const base = 1.005;

        // Difference just under the precision boundary: should pass
        const ms1 = createMatcher(base);
        expect(() => toBeCloseTo.call(ms1, 1.0049, 2)).not.toThrow();

        const ms2 = createMatcher(base);
        expect(() => toBeCloseTo.call(ms2, 1.004, 2)).not.toThrow(xJetExpectError);

        // Difference just over the precision boundary: should fail
        const ms3 = createMatcher(base);
        expect(() => toBeCloseTo.call(ms3, 1.0039, 3)).toThrow(xJetExpectError);
    });

    test('handles large precision values gracefully', () => {
        const ms = createMatcher(0.1234567890123456789);

        // Should pass at precision 18 for a close value
        expect(() => toBeCloseTo.call(ms, 0.1234567890123456790, 18)).not.toThrow();

        // Should fail at precision 18 for a more distant value
        expect(() => toBeCloseTo.call(ms, 0.123456789012345, 18)).toThrow(xJetExpectError);
    });

    test('handles precision above 20 by using toString for expectedDifferenceStr', () => {
        const ms = createMatcher(0.1);
        expect(() => toBeCloseTo.call(ms, 0.1, 21)).not.toThrow();
    });

    test('throws if precision is negative or not an integer (treats as-is)', () => {
        const ms = createMatcher(0.1);

        expect(() => toBeCloseTo.call(ms, 0.6, -1)).not.toThrow();
        expect(() => toBeCloseTo.call(ms, 0.6, 1.5)).toThrow();
    });

    test('handles zero precision properly', () => {
        const ms = createMatcher(1.4);

        expect(() => toBeCloseTo.call(ms, 1.9, 0)).toThrow();
        expect(() => toBeCloseTo.call(ms, 2.0, 0)).toThrow(xJetExpectError);
    });
});

function testComparisonMatcher(
    matcherFn: (this: MatcherService<NumericType>, expected: NumericType) => void,
    name: string,
    operator: '>' | '>=' | '<' | '<=',
    passCases: [NumericType, NumericType][],
    failCases: [NumericType, NumericType][]
) {
    describe(name, () => {
        test('passes for expected pass cases', () => {
            for (const [ received, expected ] of passCases) {
                const ms = createMatcher(received);
                expect(() => matcherFn.call(ms, expected)).not.toThrow();
            }
        });

        test('fails for expected fail cases', () => {
            for (const [ received, expected ] of failCases) {
                const ms = createMatcher(received);
                expect(() => matcherFn.call(ms, expected)).toThrow(xJetExpectError);
            }
        });

        test('throws xJetTypeError for invalid expected types', () => {
            const ms = createMatcher(5);
            expect(() => matcherFn.call(ms, 'invalid' as any)).toThrow(xJetTypeError);
        });

        test('throws xJetTypeError for invalid received types', () => {
            const ms = createMatcher('invalid' as any);
            expect(() => matcherFn.call(ms, 5)).toThrow(xJetTypeError);
        });
    });
}

testComparisonMatcher(
    toBeGreaterThan,
    'toBeGreaterThan',
    '>',
    [
        [ 10, 5 ],
        [ 5.1, 5 ],
        [ BigInt(10), BigInt(5) ]
    ],
    [
        [ 5, 10 ],
        [ 5, 5 ],
        [ BigInt(5), BigInt(10) ],
        [ BigInt(5), BigInt(5) ]
    ]
);

testComparisonMatcher(
    toBeGreaterThanOrEqual,
    'toBeGreaterThanOrEqual',
    '>=',
    [
        [ 10, 5 ],
        [ 5, 5 ],
        [ BigInt(10), BigInt(5) ],
        [ BigInt(5), BigInt(5) ]
    ],
    [
        [ 4, 5 ],
        [ BigInt(4), BigInt(5) ]
    ]
);

testComparisonMatcher(
    toBeLessThan,
    'toBeLessThan',
    '<',
    [
        [ 4, 5 ],
        [ 4.9, 5 ],
        [ BigInt(4), BigInt(5) ]
    ],
    [
        [ 5, 4 ],
        [ 5, 5 ],
        [ BigInt(5), BigInt(4) ],
        [ BigInt(5), BigInt(5) ]
    ]
);

testComparisonMatcher(
    toBeLessThanOrEqual,
    'toBeLessThanOrEqual',
    '<=',
    [
        [ 4, 5 ],
        [ 5, 5 ],
        [ BigInt(4), BigInt(5) ],
        [ BigInt(5), BigInt(5) ]
    ],
    [
        [ 6, 5 ],
        [ BigInt(6), BigInt(5) ]
    ]
);
