/**
 * Imports
 */

import { toThrow } from '@matchers/functions.matcher';
import { toHaveLength, toMatch } from '@matchers/string.matcher';
import { toBeCloseTo, toBeGreaterThan } from '@matchers/number.matcher';
import { toHaveReturned, toHaveReturnedTimes } from '@matchers/mock.matcher';
import { toBeTruthy, toBeFalsy, toBeDefined } from '@matchers/equality.matcher';
import { toHaveLastReturnedWith, toHaveNthReturnedWith } from '@matchers/mock.matcher';
import { toHaveBeenLastCalledWith, toHaveBeenNthCalledWith } from '@matchers/mock.matcher';
import { toBe, toEqual, toBeNull, toBeUndefined, toBeNaN } from '@matchers/equality.matcher';
import { toBeGreaterThanOrEqual, toBeLessThan, toBeLessThanOrEqual } from '@matchers/number.matcher';
import { toHaveBeenCalled, toHaveBeenCalledTimes, toHaveBeenCalledWith } from '@matchers/mock.matcher';
import { toHaveProperty, toBeInstanceOf, toContain, toContainEqual, toMatchObject } from '@matchers/object.matcher';

/**
 * Unified collection of matcher factories for use in the xJet framework.
 *
 * Exposes asymmetric matcher creators across multiple domains, including
 * numbers, strings, objects, equality, mocks, and functions.
 *
 * @remarks
 * All matchers are provided as immutable factories (`as const`) and can be used
 * directly in test assertions for expressive, readable expectations.
 *
 * @example
 * ```ts
 * expect(42).toSatisfy(Matchers.number.greaterThan(10));
 * expect('hello').toSatisfy(Matchers.strings.contains('ell'));
 * expect(fn).toSatisfy(Matchers.functions.calledOnce());
 * ```
 *
 * @since 1.0.0
 */

export const Matchers = {
    // functions
    toThrow,

    // strings
    toMatch,
    toHaveLength,

    // objects
    toContain,
    toMatchObject,
    toHaveProperty,
    toBeInstanceOf,
    toContainEqual,

    // equality
    toBe,
    toEqual,
    toBeNaN,
    toBeNull,
    toBeFalsy,
    toBeTruthy,
    toBeDefined,
    toBeUndefined,

    // numbers
    toBeCloseTo,
    toBeLessThan,
    toBeGreaterThan,
    toBeLessThanOrEqual,
    toBeGreaterThanOrEqual,

    // mock
    toHaveReturned,
    toHaveBeenCalled,
    toHaveReturnedTimes,
    toHaveBeenCalledWith,
    toHaveBeenCalledTimes,
    toHaveNthReturnedWith,
    toHaveLastReturnedWith,
    toHaveBeenNthCalledWith,
    toHaveBeenLastCalledWith
} as const;
