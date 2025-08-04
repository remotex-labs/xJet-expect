/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { AssertionResultInterface } from '@errors/interfaces/expect-error.interface';
import type { HandleDiffFailureInterface, HandleFailureInterface } from '@matchers/interfaces/base-matcher.interface';

/**
 * Imports
 */

import { xJetExpectError } from '@errors/expect.error';
import { diffComponent, serialize } from '@diff/diff.module';
import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

export function handleFailure(this: MatcherService, options: HandleFailureInterface): void {
    const { pass, name, hintLabel, params } = options;
    const shouldThrow = (pass && this.notModifiers) || (!pass && !this.notModifiers);
    if (!shouldThrow) return;

    const info: Array<string> = [];
    const assertion: AssertionResultInterface = {
        name,
        pass,
        actual: this.actual,
        expected: options.expected
    };

    const errorConfig = {
        assertion,
        hintLabel,
        hintChain: this.hintChain,
        params: params !== undefined ? params : []
    };

    if(this.notModifiers) {
        options.handleNot?.call(this, info);
    } else {
        options.handleInfo?.call(this, info);
    }

    throw new xJetExpectError({
        ...errorConfig,
        info
    });
}

export function handleDiffFailure(this: MatcherService, options: HandleDiffFailureInterface): void {
    handleFailure.call(this, {
        ...options,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ EXPECTED(serialize(this.actual, '').join('')) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>) {
            if (options.note) info.push(DIM(options.note));
            info.push(diffComponent(options.expected, this.actual, true));
        }
    });
}

export function handleComparisonFailure(this: MatcherService, options: HandleFailureInterface, operator: string): void {
    const space = ' '.repeat(operator.length);

    handleFailure.call(this, {
        ...options,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ operator } ${ EXPECTED(serialize(options.expected, '').join('')) }`);
            info.push(`Received:     ${ space } ${ RECEIVED(serialize(this.actual, '').join('')) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ operator } ${ EXPECTED(serialize(options.expected, '').join('')) }`);
            info.push(`Received: ${ space } ${ RECEIVED(serialize(this.actual, '').join('')) }`);
        }
    });
}
