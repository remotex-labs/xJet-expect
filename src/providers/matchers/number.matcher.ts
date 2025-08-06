/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { xJetTypeError } from '@errors/type.error';
import { getType } from '@diff/components/diff.component';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { handleComparisonFailure, handleFailure } from '@matchers/base.matcher';

export function ensureNumber(expected: unknown, actual: unknown, hintChain: Array<string>): void {
    const expectedType = getType(expected);
    const actualType = getType(actual);

    if (expectedType !== 'number') {
        throw new xJetTypeError({
            hintChain: hintChain,
            message: `${ EXPECTED('Expected') } value must be a number`,
            expected: { type: expectedType, value: expected }
        });
    }

    if (actualType !== 'number') {
        throw new xJetTypeError({
            hintChain: hintChain,
            message: `${ EXPECTED('Received') } value must be a number`,
            received: { type: actualType, value: actual }
        });
    }
}

export function ensureNumberOrBigInt(value: unknown, label: 'Expected' | 'Received', hintChain: Array<string>): void {
    const type = getType(value);
    if (type !== 'number' && type !== 'bigint') {
        throw new xJetTypeError({
            hintChain,
            message: `${ label === 'Expected' ? EXPECTED('Expected') : RECEIVED('Received') } value must be a number or bigint`,
            received: { type, value }
        });
    }
}

export function formatExpectedDiff(diff: number, precision: number, forceExponential = false): string {
    if (diff === 0) return '0';

    const exponent = Math.floor(Math.log10(Math.abs(diff)));
    const switchToExponentialAt = -100;

    if (forceExponential || exponent < switchToExponentialAt) {
        return diff.toExponential().replace(/e\+?(-?\d+)/, (_, e) => `e${ e }`);
    }

    return diff.toFixed(Math.min(precision + 1, 100));
}

export function toBeCloseTo(this: MatcherService, expected: number, numDigits: number = 2): void {
    ensureNumber(expected, this.actual, this.hintChain);

    const actual = <number>this.actual;
    const isActualFinite = Number.isFinite(actual);
    const isExpectedEqual = actual === expected;
    const bothAreInfinite = !isActualFinite && isExpectedEqual;

    const threshold = Math.pow(10, -numDigits) / 2;
    const diff = Math.abs(expected - actual);
    const pass = bothAreInfinite || diff < threshold;

    const expectedDiff = formatExpectedDiff(threshold, numDigits, this.notModifiers);
    const receivedDiff = diff.toString();
    const not = this.notModifiers ? '      ' : '  ';
    const notLabel = this.notModifiers ? 'not < ' : '< ';

    const details = [
        `Expected precision:  ${ not }${ numDigits }`,
        `Expected difference: ${ notLabel }${ EXPECTED(expectedDiff) }`,
        `Received difference: ${ not }${ RECEIVED(receivedDiff) }`
    ];

    handleFailure.call(this, {
        pass,
        name: 'toBeCloseTo',
        params: [ 'expected', 'precision' ],
        handleNot(info) {
            info.push(`Expected: not ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received:     ${ RECEIVED(serialize(actual, '').join('')) }\n`);
            info.push(...details);
        },
        handleInfo(info) {
            info.push(`Expected: ${ EXPECTED(serialize(expected, '').join('')) }`);
            info.push(`Received: ${ RECEIVED(serialize(actual, '').join('')) }\n`);
            info.push(...details);
        }
    });
}

export function toBeGreaterThan(this: MatcherService, expected: number | bigint): void {
    ensureNumberOrBigInt(expected, 'Expected', this.hintChain);
    ensureNumberOrBigInt(this.actual, 'Received', this.hintChain);

    const actual = this.actual as number | bigint;
    const pass = actual > expected;

    handleComparisonFailure.call(this, {
        pass,
        name: 'toBeGreaterThan'
    }, '>');
}

export function toBeGreaterThanOrEqual(this: MatcherService, expected: number | bigint): void {
    ensureNumberOrBigInt(expected, 'Expected', this.hintChain);
    ensureNumberOrBigInt(this.actual, 'Received', this.hintChain);

    const actual = this.actual as number | bigint;
    const pass = actual >= expected;

    handleComparisonFailure.call(this, {
        pass,
        name: 'toBeGreaterThanOrEqual'
    }, '>=');
}

export function toBeLessThan(this: MatcherService, expected: number | bigint): void {
    ensureNumberOrBigInt(expected, 'Expected', this.hintChain);
    ensureNumberOrBigInt(this.actual, 'Received', this.hintChain);

    const actual = this.actual as number | bigint;
    const pass = actual < expected;

    handleComparisonFailure.call(this, {
        pass,
        name: 'toBeLessThan'
    }, '<');
}

export function toBeLessThanOrEqual(this: MatcherService, expected: number | bigint): void {
    ensureNumberOrBigInt(expected, 'Expected', this.hintChain);
    ensureNumberOrBigInt(this.actual, 'Received', this.hintChain);

    const actual = this.actual as number | bigint;
    const pass = actual <= expected;

    handleComparisonFailure.call(this, {
        pass,
        name: 'toBeLessThan'
    }, '<=');
}
