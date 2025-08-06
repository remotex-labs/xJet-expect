/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { getType, serialize } from '@diff/diff.module';
import { equals } from '@components/object.component';
import { handleFailure } from '@matchers/base.matcher';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { xJetTypeError } from '@errors/type.error';

export type MockInvocationResultType = 'return' | 'throw' | 'incomplete';

export interface MockInvocationResultInterface<T> {
    type: MockInvocationResultType;
    value: T | (unknown & { type?: never }) | undefined | unknown;
}

export interface MocksStateInterface<ReturnType, Args extends Array<unknown> = [], Context = unknown> {
    calls: Array<Args>;
    lastCall?: Args;
    contexts: Array<Context>;
    instances: Array<Context>;
    invocationCallOrder: Array<number>;
    results: Array<MockInvocationResultInterface<ReturnType>>;
}

interface MockStateInterface {
    name: string;
    xJetMock: boolean;
    mock: MocksStateInterface<unknown>;
}


function printReceivedArgs(args: Array<unknown>): string {
    return args.map((arg: unknown) => {
        if (Array.isArray(arg) && arg.length > 10) {
            const truncatedArray = [ ...arg.slice(0, 10), '...' ];

            return RECEIVED(serialize(truncatedArray, '').join(''));
        }

        return RECEIVED(serialize(arg, '').join(''));
    }).join(', ');
}


export function toHaveBeenCalled(this: MatcherService<MockStateInterface>): void {
    if (!this.actual.xJetMock) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a mock or spy function`,
            received: { type: getType(this.actual), value: this.actual }
        });
    }

    const count = this.actual.mock.calls.length;
    const calls = this.actual.mock.calls;

    handleFailure.call(this, {
        pass: count > 0,
        name: 'toHaveBeenCalled',
        params: [],
        handleNot(info) {
            info.push(`Expected number of calls: ${ EXPECTED('0') }`);
            info.push(`Received number of calls: ${ RECEIVED(count.toString()) }\n`);
            calls.map((args: Array<unknown>, i: number) => {
                info.push(`${ i + 1 }: ${ printReceivedArgs(args) }`);
            });
        },
        handleInfo(info) {
            info.push(`Expected number of calls: >= ${ EXPECTED('1') }`);
            info.push(`Received number of calls:    ${ RECEIVED(count.toString()) }\n`);
        }
    });
}

export function toHaveBeenCalledTimes(this: MatcherService<MockStateInterface>, expected: number): void {
    if (!this.actual.xJetMock) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must be a mock or spy function`,
            received: { type: getType(this.actual), value: this.actual }
        });
    }

    if(!Number.isSafeInteger(expected) || expected < 0) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a non-negative integer`,
            expected: { type: getType(expected), value: expected }
        });
    }

    const count = this.actual.mock.calls.length;
    handleFailure.call(this, {
        pass: count > 0,
        name: 'toHaveBeenCalled',
        params: [ 'expected' ],
        handleNot(info) {
            info.push(`Expected number of calls: != ${ EXPECTED(expected.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected number of calls: == ${ EXPECTED(expected.toString()) }`);
            info.push(`Received number of calls:    ${ RECEIVED(count.toString()) }\n`);
        }
    });
}

export function toHaveBeenCalledWith(): void {

}

export function toHaveBeenLastCalledWith(this: MatcherService<MockStateInterface>): void {

}

export function toHaveBeenNthCalledWith(this: MatcherService<MockStateInterface>): void {

}

export function toHaveLastReturnedWith(this: MatcherService<MockStateInterface>): void {

}

export function toHaveNthReturnedWith(this: MatcherService<MockStateInterface>): void {

}

export function toHaveReturned(this: MatcherService<MockStateInterface>): void {

}

export function toHaveReturnedTimes(this: MatcherService<MockStateInterface>, expected: number): void {
    if (!this.actual.xJetMock) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ RECEIVED('Received') } value must be a mock or spy function`,
            received: { type: getType(this.actual), value: this.actual }
        });
    }

    if(!Number.isSafeInteger(expected) || expected < 0) {
        throw new xJetTypeError({
            hintChain: this.hintChain,
            message: `${ EXPECTED('Expected') } value must be a non-negative integer`,
            expected: { type: getType(expected), value: expected }
        });
    }

    const count = this.actual.mock.results.reduce(
        (n: number, result: { type: string }) => (result.type === 'return' ? n + 1 : n),
        0
    );

    const pass = count === expected;
    handleFailure.call(this, {
        pass,
        name: 'toHaveReturnedTimes',
        params: [ 'expected' ],
        handleNot(info) {
            info.push(`Expected number of calls: != ${ EXPECTED(expected.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected number of calls: == ${ EXPECTED(expected.toString()) }`);
            info.push(`Received number of calls:    ${ RECEIVED(count.toString()) }\n`);
        }
    });
}

export function toHaveReturnedWith(this: MatcherService<MockStateInterface>): void {

}
