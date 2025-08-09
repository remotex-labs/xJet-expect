/**
 * Imports
 */

import { AnyPattern } from '@patterns/any.pattern';
import { ArrayOfPattern } from '@patterns/array-of.pattern';
import { CloseToPattern } from '@patterns/close-to.pattern';
import { AnythingPattern } from '@patterns/anything.pattern';
import { StringMatchingPattern } from '@patterns/string-matching.pattern';
import { ArrayContainingPattern } from '@patterns/array-containing.pattern';
import { ObjectContainingPattern } from '@patterns/object-containing.pattern';
import { StringContainingPattern } from '@patterns/string-containing.pattern';

/**
 * Collection of factory methods for creating common pattern matchers in the xJet framework.
 *
 * Provides easy access to asymmetric matcher creators for various matching strategies,
 * including positive and negated (`not`) variants.
 *
 * @remarks
 * Each factory method returns an instance of a pattern matcher configured
 * for the specified matching behavior.
 *
 * The `not` namespace provides inverse matchers that negate the match result.
 *
 * @example
 * ```ts
 * const pattern = Patterns.any(String);
 * const notPattern = Patterns.not.closeTo(5, 0.1);
 * ```
 *
 * @since 1.0.0
 */

export const Patterns = {
    any: AnyPattern.create,
    anything: AnythingPattern.create,
    closeTo: CloseToPattern.create.bind(null, false),
    arrayOf: ArrayOfPattern.create.bind(null, false),
    stringMatching: StringMatchingPattern.create.bind(null, false),
    arrayContaining: ArrayContainingPattern.create.bind(null, false),
    objectContaining: ObjectContainingPattern.create.bind(null, false),
    stringContaining: StringContainingPattern.create.bind(null, false),
    not: {
        closeTo: CloseToPattern.create.bind(null, true),
        arrayOf: ArrayOfPattern.create.bind(null, true),
        stringMatching: StringMatchingPattern.create.bind(null, true),
        arrayContaining: ArrayContainingPattern.create.bind(null, true),
        objectContaining: ObjectContainingPattern.create.bind(null, false),
        stringContaining: StringContainingPattern.create.bind(null, true)
    }
} as const;



