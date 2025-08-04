/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { equals } from '@components/object.component';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { handleDiffFailure, handleFailure } from '@matchers/base.matcher';

export function toBe(this: MatcherService, expected: unknown): void {
    const pass = Object.is(this.actual, expected);
    const note =
        !pass && equals(this.actual, expected)
            ? 'If it should pass with deep equality, replace "toBe" with "toEqual"'
            : undefined;

    handleDiffFailure.call(this, {
        note,
        pass,
        expected,
        name: 'toBe',
        params: [ 'expected' ],
        hintLabel: 'Object.is equality'
    });
}

export function toEqual(this: MatcherService, expected: unknown): void {
    const pass = equals(this.actual, expected);
    handleDiffFailure.call(this, {
        pass,
        expected,
        name: 'toEqual',
        params: [ 'expected' ],
        hintLabel: 'deep equality'
    });
}

export function toBeNull(this: MatcherService): void {
    const pass = this.actual === null;
    handleDiffFailure.call(this, {
        pass,
        expected: null,
        name: 'toBeNull'
    });
}

export function toBeUndefined(this: MatcherService): void {
    const pass = this.actual === undefined;
    handleDiffFailure.call(this, {
        pass,
        expected: undefined,
        name: 'toBeUndefined'
    });
}

export function toBeNaN(this: MatcherService): void {
    const pass = Number.isNaN(this.actual);
    handleDiffFailure.call(this, {
        pass,
        expected: NaN,
        name: 'toBeNaN'
    });
}


export function toBeTruthy(this: MatcherService): void {
    const pass = !!this.actual;
    handleDiffFailure.call(this, {
        pass,
        expected: true,
        name: 'toBeTruthy'
    });
}

export function toBeFalsy(this: MatcherService): void {
    const pass = !this.actual;
    handleDiffFailure.call(this, {
        pass,
        expected: false,
        name: 'toBeFalsy'
    });
}

export function toBeDefined(this: MatcherService): void {
    const pass = this.actual !== void 0;
    handleFailure.call(this, {
        pass,
        name: 'toBeDefined',
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ EXPECTED(serialize(undefined, '').join('')) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Received: ${ RECEIVED(serialize(this.actual, '').join('')) }`);
        }
    });
}

