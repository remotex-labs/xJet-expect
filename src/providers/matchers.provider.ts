/**
 * Imports
 */

import * as mocks from '@matchers/mock.matcher';
import * as number from '@matchers/number.matcher';
import * as objects from '@matchers/object.matcher';
import * as strings from '@matchers/string.matcher';
import * as equality from '@matchers/equality.matcher';
import * as functions from '@matchers/functions.matcher';

export const Matchers = {
    ...mocks,
    ...number,
    ...strings,
    ...objects,
    ...equality,
    ...functions
} as const;
