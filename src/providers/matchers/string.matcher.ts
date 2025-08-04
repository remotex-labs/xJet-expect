import type { MatcherService } from '@services/matcher.service';
import { xJetTypeError } from '@errors/type.error';
import { handleDiffFailure, handleFailure } from '@matchers/base.matcher';
import { diffComponent, getType } from '@diff/components/diff.component';
import { DIM, EXPECTED, RECEIVED } from '@components/color.component';
import { serialize } from '@diff/components/serialize.component';
import { equals } from '@components/object.component';

export function toHaveLength(this: MatcherService, expected: number | bigint): void {
    const actual = <string>this.actual;
    const actualType = getType(this.actual);

    if (typeof actual?.length !== 'number') {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must have a length property whose value must be a number`,
            received: { type: actualType, value: this.actual }
        });
    }

    const pass = actual.length === expected;
    handleFailure.call(this, {
        pass,
        name: 'toHaveLength',
        params: [ 'expected' ],
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected length: not ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received string:     ${ RECEIVED(serialize(this.actual, '').join('')) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected length: ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received length: ${ RECEIVED(serialize(actual.length, '').join('')) }`);
            info.push(`Received string: ${ RECEIVED(serialize(this.actual, '').join('')) }`);
        }
    });
}

export function toMatch(this: MatcherService, expected: RegExp | string): void {
    const actual = this.actual;
    const actualType = getType(actual);

    if (typeof actual !== 'string') {
        throw new xJetTypeError({
            params: [ 'expected' ],
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must be a string`,
            received: { value: actual, type: actualType }
        });
    }

    const expectedType = getType(expected);
    const isValidExpected =
        typeof expected === 'string' ||
        (expected instanceof RegExp && typeof expected.test === 'function');

    if (!isValidExpected) {
        throw new xJetTypeError({
            params: [ 'expected' ],
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a string or regular expression`,
            expected: { value: expected, type: expectedType }
        });
    }

    const pass = typeof expected === 'string'
        ? actual.includes(expected)
        : new RegExp(expected).test(actual);

    handleFailure.call(this, {
        pass,
        name: 'toMatch',
        params: [ 'expected' ],
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ EXPECTED(serialize(this.actual, '').join('')) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            if(expected instanceof RegExp) {
                info.push(`Expected pattern: ${ EXPECTED(serialize(expected, '').join('')) }`);
                info.push(`Received string:  ${ RECEIVED(serialize(this.actual, '').join('')) }`);
            } else {
                info.push(diffComponent(expected, this.actual, true));
            }
        }
    });
}
