/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { xJetExpectError } from '@errors/expect.error';
import { toHaveLength, toMatch } from '@matchers/string.matcher';

/**
 * CreateMatcherService
 */

function createMatcherService(received: unknown, notModifier = false, assertionChain: Array<string> = [ 'test' ]): MatcherService<string> {
    return {
        received,
        notModifier,
        assertionChain
    } as unknown as MatcherService<string>;
}

/**
 * toHaveLength
 */

describe('toHaveLength', () => {
    test('passes when lengths match', () => {
        const ms = createMatcherService('abc');
        expect(() => toHaveLength.call(ms, 3)).not.toThrow();
        expect(() => toHaveLength.call(ms, BigInt(3))).not.toThrow();
    });

    test('fails when lengths do not match', () => {
        const ms = createMatcherService('abc');
        expect(() => toHaveLength.call(ms, 5)).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError if expected length is not number/bigint', () => {
        const ms = createMatcherService('abc');
        expect(() => toHaveLength.call(ms, 'invalid' as any)).toThrow(xJetTypeError);
    });

    test('throws xJetTypeError if received length is not number', () => {
        const ms = createMatcherService({ length: 'three' } as any);
        expect(() => toHaveLength.call(ms, 3)).toThrow(xJetTypeError);
    });

    test('inverts throw behavior when notModifier is true', () => {
        const ms = createMatcherService('abc', true);
        expect(() => toHaveLength.call(ms, 5)).not.toThrow();
        expect(() => toHaveLength.call(ms, 3)).toThrow(xJetExpectError);
    });
});

/**
 * toMatch
 */

describe('toMatch', () => {
    test('passes for substring match', () => {
        const ms = createMatcherService('Hello World');
        expect(() => toMatch.call(ms, 'World')).not.toThrow();
    });

    test('fails for substring mismatch', () => {
        const ms = createMatcherService('Hello World');
        expect(() => toMatch.call(ms, 'Earth')).toThrow(xJetExpectError);
    });

    test('passes for RegExp match', () => {
        const ms = createMatcherService('Hello World');
        expect(() => toMatch.call(ms, /world/i)).not.toThrow();
    });

    test('fails for RegExp mismatch', () => {
        const ms = createMatcherService('Hello World');
        expect(() => toMatch.call(ms, /earth/i)).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError if received is not string', () => {
        const ms = createMatcherService(123 as any);
        expect(() => toMatch.call(ms, '123')).toThrow(xJetTypeError);
    });

    test('throws xJetTypeError if expected is not string or RegExp', () => {
        const ms = createMatcherService('Hello World');
        expect(() => toMatch.call(ms, 123 as any)).toThrow(xJetTypeError);
    });

    test('inverts throw behavior when notModifier is true', () => {
        const ms = createMatcherService('Hello World', true);
        expect(() => toMatch.call(ms, 'Earth')).not.toThrow();
        expect(() => toMatch.call(ms, 'World')).toThrow(xJetExpectError);
    });
});
