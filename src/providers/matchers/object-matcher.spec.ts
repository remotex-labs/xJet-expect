/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { xJetExpectError } from '@errors/expect.error';
import { expect as xJetExpect } from '@components/expect.component';
import { toBeInstanceOf, toContain, toContainEqual, toHaveProperty, toMatchObject } from './object.matcher';

/**
 * CreateMatcherService
 */

function createMatcherService(received: unknown, notModifier = false): MatcherService<any> {
    return {
        received,
        notModifier,
        assertionChain: [ 'test' ]
    } as unknown as MatcherService<any>;
}

/**
 * Tests
 */

describe('toHaveProperty', () => {
    test('passes when property exists', () => {
        const ms = createMatcherService({ a: { b: 42 } });
        expect(() => toHaveProperty.call(ms, 'a.b')).not.toThrow();
    });

    test('fails when property does not exist', () => {
        const ms = createMatcherService({ a: { b: 42 } });
        expect(() => toHaveProperty.call(ms, 'a.c')).toThrow(xJetExpectError);
    });

    test('passes when property and value match', () => {
        const ms = createMatcherService({ a: { b: 42 } });
        expect(() => toHaveProperty.call(ms, 'a.b', 42)).not.toThrow();
    });

    test('fails when property value does not match', () => {
        const ms = createMatcherService({ a: { b: 42 } });
        expect(() => toHaveProperty.call(ms, 'a.b', 43)).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError for invalid path type', () => {
        const ms = createMatcherService({ a: 1 });
        expect(() => toHaveProperty.call(ms, 123 as any)).toThrow(xJetTypeError);
    });

    test('inverts behavior when notModifier is true', () => {
        const ms = createMatcherService({ a: { b: 42 } }, true);
        expect(() => toHaveProperty.call(ms, 'a.c')).not.toThrow();
        expect(() => toHaveProperty.call(ms, 'a.b')).toThrow(xJetExpectError);
    });

    test('passes with object property using asymmetric matcher', () => {
        const ms = createMatcherService({ a: 'hello' });
        expect(() => toHaveProperty.call(ms, 'a', xJetExpect.any(String))).not.toThrow();
    });

    test('fails with object property using asymmetric matcher', () => {
        const ms = createMatcherService({ a: 123 });
        expect(() => toHaveProperty.call(ms, 'a', xJetExpect.any(String))).toThrow(xJetExpectError);
    });

    test('passes with nested asymmetric matcher inside object', () => {
        const ms = createMatcherService({ a: { b: 100 } });
        expect(() => toHaveProperty.call(ms, 'a', { b: xJetExpect.any(Number) })).not.toThrow();
    });

    test('fails with nested asymmetric matcher inside object', () => {
        const ms = createMatcherService({ a: { b: 'wrong' } });
        expect(() => toHaveProperty.call(ms, 'a', { b: xJetExpect.any(Number) })).toThrow(xJetExpectError);
    });

    test('passes with deep nested asymmetric matcher', () => {
        const ms = createMatcherService({ a: { b: { c: true } } });
        expect(() => toHaveProperty.call(ms, 'a', { b: { c: xJetExpect.any(Boolean) } })).not.toThrow();
    });

    test('fails with deep nested asymmetric matcher', () => {
        const ms = createMatcherService({ a: { b: { c: 'nope' } } });
        expect(() => toHaveProperty.call(ms, 'a', { b: { c: xJetExpect.any(Boolean) } })).toThrow(xJetExpectError);
    });

    test('works with objectContaining + asymmetric nested matcher', () => {
        const ms = createMatcherService({ a: { b: { c: 10, d: 'x' } } });
        expect(() =>
            toHaveProperty.call(ms, 'a', xJetExpect.objectContaining({ b: xJetExpect.objectContaining({ c: xJetExpect.any(Number) }) }))
        ).not.toThrow();
    });

    test('fails with objectContaining + asymmetric nested matcher', () => {
        const ms = createMatcherService({ a: { b: { c: 'bad' } } });
        expect(() =>
            toHaveProperty.call(ms, 'a', xJetExpect.objectContaining({ b: xJetExpect.objectContaining({ c: xJetExpect.any(Number) }) }))
        ).toThrow(xJetExpectError);
    });
});

describe('toBeInstanceOf', () => {
    class MyClass {
    }

    class OtherClass {
    }

    test('passes when instance matches constructor', () => {
        const ms = createMatcherService(new MyClass());
        expect(() => toBeInstanceOf.call(ms, MyClass)).not.toThrow();
    });

    test('fails when instance does not match constructor', () => {
        const ms = createMatcherService(new MyClass());
        expect(() => toBeInstanceOf.call(ms, OtherClass)).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError for non-function constructor', () => {
        const ms = createMatcherService({});
        expect(() => toBeInstanceOf.call(ms, 123 as any)).toThrow(xJetTypeError);
    });

    test('inverts behavior when notModifier is true', () => {
        const ms = createMatcherService(new MyClass(), true);
        expect(() => toBeInstanceOf.call(ms, OtherClass)).not.toThrow();
        expect(() => toBeInstanceOf.call(ms, MyClass)).toThrow(xJetExpectError);
    });
});

describe('toContain', () => {
    test('passes for array containing value', () => {
        const ms = createMatcherService([ 1, 2, 3 ]);
        expect(() => toContain.call(ms, 2)).not.toThrow();
    });

    test('fails for array without value', () => {
        const ms = createMatcherService([ 1, 2, 3 ]);
        expect(() => toContain.call(ms, 4)).toThrow(xJetExpectError);
    });

    test('passes for string containing substring', () => {
        const ms = createMatcherService('hello world');
        expect(() => toContain.call(ms, 'world')).not.toThrow();
    });

    test('fails for string without substring', () => {
        const ms = createMatcherService('hello world');
        expect(() => toContain.call(ms, 'mars')).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError when expected type mismatches string received', () => {
        const ms = createMatcherService('hello');
        expect(() => toContain.call(ms, 123 as any)).toThrow(xJetTypeError);
    });

    test('inverts behavior when notModifier is true', () => {
        const ms = createMatcherService([ 1, 2, 3 ], true);
        expect(() => toContain.call(ms, 4)).not.toThrow();
        expect(() => toContain.call(ms, 2)).toThrow(xJetExpectError);
    });
});

describe('toContainEqual', () => {
    test('passes for deeply equal object', () => {
        const ms = createMatcherService([{ a: 1 }, { b: 2 }]);
        expect(() => toContainEqual.call(ms, { b: 2 })).not.toThrow();
    });

    test('fails when no deeply equal element exists', () => {
        const ms = createMatcherService([{ a: 1 }, { b: 2 }]);
        expect(() => toContainEqual.call(ms, { c: 3 })).toThrow(xJetExpectError);
    });

    test('inverts behavior when notModifier is true', () => {
        const ms = createMatcherService([{ a: 1 }], true);
        expect(() => toContainEqual.call(ms, { b: 2 })).not.toThrow();
        expect(() => toContainEqual.call(ms, { a: 1 })).toThrow(xJetExpectError);
    });
});

describe('toMatchObject', () => {
    test('passes for exactly equal objects', () => {
        const ms = createMatcherService({ a: 1, b: 2 });
        expect(() => toMatchObject.call(ms, { a: 1, b: 2 })).not.toThrow();
    });

    test('passes for partial match', () => {
        const ms = createMatcherService({ a: 1, b: 2 });
        expect(() => toMatchObject.call(ms, { a: 1 })).not.toThrow();
    });

    test('fails if any expected key does not match', () => {
        const ms = createMatcherService({ a: 1, b: 2 });
        expect(() => toMatchObject.call(ms, { a: 2 })).toThrow(xJetExpectError);
    });

    test('fails if expected key is missing in received', () => {
        const ms = createMatcherService({ a: 1 });
        expect(() => toMatchObject.call(ms, { a: 1, b: 2 })).toThrow(xJetExpectError);
    });

    test('passes for deep partial match', () => {
        const ms = createMatcherService({ user: { id: 1, name: 'John' } });
        expect(() => toMatchObject.call(ms, { user: { id: 1 } })).not.toThrow();
    });

    test('fails for deep mismatch', () => {
        const ms = createMatcherService({ user: { id: 1, name: 'John' } });
        expect(() => toMatchObject.call(ms, { user: { id: 2 } })).toThrow(xJetExpectError);
    });

    test('throws xJetTypeError if received is not an object', () => {
        const ms = createMatcherService(null as any);
        expect(() => toMatchObject.call(ms, { a: 1 })).toThrow(xJetTypeError);
    });

    test('throws xJetTypeError if expected is not an object', () => {
        const ms = createMatcherService({ a: 1 });
        expect(() => toMatchObject.call(ms, null as any)).toThrow(xJetExpectError);
    });

    test('not modifier inverts passing condition', () => {
        const ms = createMatcherService({ a: 1, b: 2 }, true); // not = true
        expect(() => toMatchObject.call(ms, { a: 2 })).not.toThrow();
        expect(() => toMatchObject.call(ms, { a: 1, b: 2 })).toThrow(xJetExpectError);
    });

    test('ignores extra keys in received', () => {
        const ms = createMatcherService({ a: 1, b: 2, extra: 123 });
        expect(() => toMatchObject.call(ms, { a: 1, b: 2 })).not.toThrow();
    });
});
