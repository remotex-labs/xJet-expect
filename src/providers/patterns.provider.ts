/**
 * Imports
 */

import { AnyPattern } from '@patterns/any.pattern';
import { CloseToPattern } from '@patterns/close-to.pattern';
import { AnythingPattern } from '@patterns/anything.pattern';
import { StringMatchingPattern } from '@patterns/string-matching.pattern';
import { ArrayContainingPattern } from '@patterns/array-containing.pattern';
import { ObjectContainingPattern } from '@patterns/object-containing.pattern';
import { StringContainingPattern } from '@patterns/string-containing.pattern';

export const Patterns = {
    any: AnyPattern.create,
    anything: AnythingPattern.create,
    closeTo: CloseToPattern.create.bind(null, false),
    stringMatching: StringMatchingPattern.create.bind(null, false),
    arrayContaining: ArrayContainingPattern.create.bind(null, false),
    objectContaining: ObjectContainingPattern.create.bind(null, false),
    stringContaining: StringContainingPattern.create.bind(null, false),
    not: {
        closeTo: CloseToPattern.create.bind(null, true),
        stringMatching: StringMatchingPattern.create.bind(null, true),
        arrayContaining: ArrayContainingPattern.create.bind(null, true),
        objectContaining: ObjectContainingPattern.create.bind(null, true),
        stringContaining: StringContainingPattern.create.bind(null, true)
    }
} as const;



