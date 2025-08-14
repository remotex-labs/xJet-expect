/**
 * Import will remove at compile time
 */

/**
 * Imports
 */

import { toThrow } from '@matchers/functions.matcher';
import { MatcherService } from '@services/matcher.service';
import { AbstractPattern } from '@patterns/abstract.pattern';

/**
 * MatcherService
 */

class TestMatcher extends MatcherService {
    assertionChain = [ 'toThrow' ];

    constructor(received: unknown) {
        super(received);
    }
}

class GreaterThan extends AbstractPattern {
    constructor(private threshold: number) {
        super('greaterThan', false);
    }

    get expectedLabel(): string {
        return 'number';
    }

    matches(value: unknown): boolean {
        return this.applyInverse(typeof value === 'number' && value > this.threshold);
    }
}

/**
 * Tests
 */

describe('toThrow matcher', () => {
    test('throws when function throws an Error', () => {
        const fn = () => {
            throw new Error('Oops');
        };

        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher)).not.toThrow();
        expect(() => toThrow.call(matcher, 'Oops')).not.toThrow();
        expect(() => toThrow.call(matcher, /Oops/)).not.toThrow();
        expect(() => toThrow.call(matcher, Error)).not.toThrow();
    });

    test('throws when function throws a string', () => {
        const fn = () => {
            throw 'fail';
        };
        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher)).not.toThrow();
        expect(() => toThrow.call(matcher, 'fail')).not.toThrow();
        expect(() => toThrow.call(matcher, /fail/)).not.toThrow();
    });

    test('throws when function throws an object', () => {
        const obj = { code: 123 };
        const fn = () => {
            throw obj;
        };
        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher, obj)).not.toThrow();
        expect(() => toThrow.call(matcher)).not.toThrow();
    });

    test('supports asymmetric matchers', () => {
        const fn = () => {
            throw 42;
        };
        const matcher = new TestMatcher(fn);
        const pattern = new GreaterThan(40);

        expect(() => toThrow.call(matcher, pattern)).not.toThrow();
    });

    test('fails when function does not throw', () => {
        const fn = () => 42;
        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher)).toThrow();
        expect(() => toThrow.call(matcher, Error)).toThrow();
        expect(() => toThrow.call(matcher, 'fail')).toThrow();
    });

    test('works with .not modifier', () => {
        const fn = () => {
            throw new Error('Oops');
        };
        const matcher: any = new TestMatcher(fn);
        // simulate .not
        matcher.notModifier = true;

        expect(() => toThrow.call(matcher, Error)).toThrow();
        expect(() => toThrow.call(matcher, 'Oops')).toThrow();
    });

    test('handles rejectsModifier with promises', () => {
        const promise = new TypeError('async fail');
        const matcher: any = new TestMatcher(promise);
        matcher.rejectsModifier = true;

        expect(() => toThrow.call(matcher, TypeError)).not.toThrow();
        expect(() => toThrow.call(matcher, 'async fail')).not.toThrow();
    });

    test('handles RegExp matching', () => {
        const fn = () => {
            throw new Error('something went wrong');
        };
        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher, /went wrong/)).not.toThrow();
        expect(() => toThrow.call(matcher, /not match/)).toThrow();
    });

    test('handles object mismatch', () => {
        const obj = { code: 123 };
        const fn = () => {
            throw { code: 456 };
        };
        const matcher = new TestMatcher(fn);

        expect(() => toThrow.call(matcher, obj)).toThrow();
    });
});
