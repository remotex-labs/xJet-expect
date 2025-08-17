/**
 * Imports
 */

import * as mocks from '@matchers/mock.matcher';
import * as number from '@matchers/number.matcher';
import * as objects from '@matchers/object.matcher';
import * as strings from '@matchers/string.matcher';
import * as equality from '@matchers/equality.matcher';
import * as functions from '@matchers/functions.matcher';

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
    ...mocks,
    ...number,
    ...strings,
    ...objects,
    ...equality,
    ...functions
} as const;
