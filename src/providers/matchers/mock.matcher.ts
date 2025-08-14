/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { MockInvocationResultInterface, MockStateInterface } from '@matchers/interfaces/mock-matcher.interface';

/**
 * Imports
 */

import { equals } from '@components/object.component';
import { ensurePositiveNumber } from '@handlers/number.handler';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { handleFailure, serializeOneLine } from '@handlers/matchers.handler';
import { serializeHighlightedCalls, serializeReturnList } from '@handlers/mock.handler';
import { ensureMock, serializeCallArgs, serializeCallList } from '@handlers/mock.handler';

/**
 * Asserts that a mock function has been called at least once.
 *
 * @remarks
 * This matcher validates that the mock function represented by `this.received`
 * has been invoked one or more times. It uses {@link handleFailure} to report
 * a descriptive failure message if the assertion does not pass.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn();
 * expect(mockFn).toHaveBeenCalled(); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * expect(mockFn).toHaveBeenCalled(); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveBeenCalled(this: MatcherService<MockStateInterface>): void {
    ensureMock.call(this);
    const calls = this.received.mock.calls;
    const count = this.received.mock.calls.length;

    handleFailure.call(this, {
        pass: count > 0,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`Expected calls: ${ EXPECTED('0') }`);
            info.push(`Received calls: ${ RECEIVED(count.toString()) }\n`);
            info.push(serializeCallList([], calls));
        },
        handleInfo(info) {
            info.push(`Expected calls: >= ${ EXPECTED('1') }`);
            info.push(`Received calls:    ${ RECEIVED(count.toString()) }\n`);
        }
    });
}

/**
 * Asserts that a mock function has been called a specific number of times.
 *
 * @param expected - The exact number of times the mock function is expected to have been called.
 *
 * @remarks
 * This matcher validates that the mock function represented by `this.received`
 * has been invoked exactly `expected` times. It performs the following checks:
 * 1. Ensures that `this.received` is a mock function via {@link ensureMock}.
 * 2. Ensures that `expected` is a positive number using {@link ensurePositiveNumber}.
 * 3. Compares the actual call count to `expected` and reports via {@link handleFailure}.
 *
 * @throws {@link xJetTypeError} If `expected` is not a positive number.
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn();
 * expect(mockFn).toHaveBeenCalledTimes(1); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * expect(mockFn).toHaveBeenCalledTimes(2); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveBeenCalledTimes(this: MatcherService<MockStateInterface>, expected: number | bigint): void {
    const expectedLabels = [ 'expected' ];

    ensureMock.call(this, expectedLabels);
    ensurePositiveNumber.call(this, expected, 'expected', expectedLabels);

    const count = this.received.mock.calls.length;
    handleFailure.call(this, {
        expected,
        pass: count == expected,
        expectedLabels,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`Expected calls: != ${ EXPECTED(expected.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected calls: ${ EXPECTED(expected.toString()) }`);
            info.push(`Received calls: ${ RECEIVED(count.toString()) }\n`);
        }
    });
}

/**
 * Asserts that a mock function has been called with specific arguments at least once.
 *
 * @param args - The expected arguments to check against the mock function calls.
 *
 * @remarks
 * This matcher validates that the mock function represented by `this.received`
 * has been invoked at least once with arguments exactly matching `args`. It performs the following:
 * 1. Ensures that `this.received` is a mock function via {@link ensureMock}.
 * 2. Compares each call to the expected arguments using {@link equals}.
 * 3. Records the indices of calls that match the expected arguments.
 * 4. Reports assertion results and detailed call differences using {@link handleFailure},
 *    {@link serializeCallArgs}, {@link serializeCallList}, and {@link serializeHighlightedCalls}.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(1, 'test');
 * expect(mockFn).toHaveBeenCalledWith(1, 'test'); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(2, 'test');
 * expect(mockFn).toHaveBeenCalledWith(1, 'test'); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveBeenCalledWith(this: MatcherService<MockStateInterface>, ...args: Array<unknown>): void {
    const expectedLabels = [ '...args' ];
    ensureMock.call(this, expectedLabels);

    const calls = this.received.mock.calls;
    const count = this.received.mock.calls.length;
    const indices: Array<number> = [];

    calls.forEach((call, index) => {
        if (call.length === args.length && equals(args, call)) {
            indices.push(index + 1);
        }
    });

    const pass = indices.length > 0;
    handleFailure.call(this, {
        pass,
        expectedLabels,
        expected: args,
        receivedLabeled: this.received.name,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ serializeCallArgs(args) }`);
            info.push(`Received:\n\n${ serializeHighlightedCalls(args, calls, indices) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ serializeCallArgs(args) }`);
            info.push(`Received: \n\n${ serializeCallList(args, calls) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that a mock function was last called with the specified arguments.
 *
 * @param args - The expected arguments to check against the last mock function call.
 *
 * @remarks
 * This matcher validates that the mock function represented by `this.received`
 * was invoked last with arguments exactly matching `args`. It performs the following:
 * 1. Ensures that `this.received` is a mock function via {@link ensureMock}.
 * 2. Retrieves the last call from the mock’s call history.
 * 3. Compares the last call arguments with the expected arguments using {@link equals}.
 * 4. Reports assertion results and detailed call differences using {@link handleFailure},
 *    {@link serializeCallArgs}, and {@link serializeCallList}.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(1, 'first');
 * mockFn(2, 'last');
 * expect(mockFn).toHaveBeenLastCalledWith(2, 'last'); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(1, 'first');
 * mockFn(2, 'last');
 * expect(mockFn).toHaveBeenLastCalledWith(1, 'first'); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveBeenLastCalledWith(this: MatcherService<MockStateInterface>, ...args: Array<unknown>): void {
    const expectedLabels = [ '...args' ];
    ensureMock.call(this, expectedLabels);

    const calls = this.received.mock.calls;
    const count = calls.length;
    const callIndex = this.received.mock.calls.at(-1);
    const pass = callIndex !== undefined && equals(args, callIndex);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        expected: args,
        receivedLabeled: this.received.name,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: not ${ serializeCallArgs(args) }`);
            info.push(`Received: \n\n${ serializeCallList(args, calls, calls.length) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`Expected: ${ serializeCallArgs(args) }`);
            info.push(`Received: \n\n${ serializeCallList(args, calls, calls.length) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that a mock function was called with the specified arguments on its N-th invocation.
 *
 * @param nthCall - The 1-based index of the call to check.
 * @param args - The expected arguments to check for the N-th call.
 *
 * @remarks
 * This matcher performs the following steps:
 * 1. Validates that `this.received` is a mock function using {@link ensureMock}.
 * 2. Ensures that `nthCall` is a positive number via {@link ensurePositiveNumber}.
 * 3. Retrieves the N-th call from the mock’s call history.
 * 4. Compares the N-th call arguments to the expected `args` using {@link equals}.
 * 5. Reports assertion results and detailed call differences using {@link handleFailure},
 *    {@link serializeCallArgs}, and {@link serializeCallList}.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 * @throws If `nthCall` is not a positive number, {@link ensurePositiveNumber} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn('first');
 * mockFn('second');
 * expect(mockFn).toHaveBeenNthCalledWith(2, 'second'); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn('first');
 * mockFn('second');
 * expect(mockFn).toHaveBeenNthCalledWith(1, 'second'); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveBeenNthCalledWith(this: MatcherService<MockStateInterface>, nthCall: number, ...args: Array<unknown>): void {
    const expectedLabels = [ 'nthCall', '...args' ];
    ensureMock.call(this, expectedLabels);
    ensurePositiveNumber.call(this, nthCall, 'nthCall', expectedLabels);

    const calls = this.received.mock.calls;
    const count = calls.length;
    const callIndex = this.received.mock.calls.at(nthCall - 1);
    const pass = callIndex !== undefined && equals(args, callIndex);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        expected: args,
        receivedLabeled: this.received.name,
        handleNot(this: MatcherService, info: Array<string>): void {
            info.push(`nthCall: ${ nthCall }`);
            info.push(`Expected: not ${ serializeCallArgs(args) }`);
            info.push(`Received: \n\n${ serializeCallList(args, calls, nthCall) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(this: MatcherService, info: Array<string>): void {
            info.push(`nthCall: ${ nthCall }`);
            info.push(`Expected: ${ serializeCallArgs(args) }`);
            info.push(`Received: \n\n${ serializeCallList(args, calls, nthCall) }\n`);
            info.push(`Calls: ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that a mock function has returned at least once.
 *
 * @remarks
 * This matcher performs the following steps:
 * 1. Validates that `this.received` is a mock function using {@link ensureMock}.
 * 2. Iterates over the mock’s results to count how many invocations returned a value.
 * 3. Collects all returned values for reporting.
 * 4. Delegates assertion reporting to {@link handleFailure}, including a summary of returned values
 *    and total calls using {@link serializeReturnList}.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn();
 * expect(mockFn).toHaveReturned(); // Passes if the function returned at least once
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * expect(mockFn).toHaveReturned(); // Fails if the function was never called or never returned
 * ```
 *
 * @since 1.0.0
 */

export function toHaveReturned(this: MatcherService<MockStateInterface>): void {
    ensureMock.call(this);
    const results: Array<unknown> = [];
    const count = this.received.mock.calls.length;
    const resultsCount = this.received.mock.results.reduce(
        (n: number, result: MockInvocationResultInterface<unknown>) => {
            if (result.type === 'return') {
                results.push(result.value);

                return n + 1;
            }

            return n;
        },
        0
    );

    handleFailure.call(this, {
        pass: resultsCount > 0,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`Expected returns: ${ EXPECTED('0') }`);
            info.push(`Received returns: ${ RECEIVED(resultsCount.toString()) }\n`);
            info.push(serializeReturnList(undefined, results));
            info.push(`\nCalls: ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected returns: >= ${ EXPECTED('1') }`);
            info.push(`Received returns:    ${ RECEIVED(resultsCount.toString()) }`);
            info.push(`Calls:               ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that a mock function has returned a specific number of times.
 *
 * @param expected - The expected number of times the mock function should have returned.
 *
 * @remarks
 * This matcher performs the following steps:
 * 1. Validates that `this.received` is a mock function using {@link ensureMock}.
 * 2. Ensures that the `expected` value is a positive number using {@link ensurePositiveNumber}.
 * 3. Counts the number of returned values in the mock's results.
 * 4. Delegates assertion reporting to {@link handleFailure}, including a summary of total calls.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 * @throws If `expected` is not a positive number, {@link ensurePositiveNumber} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn();
 * expect(mockFn).toHaveReturnedTimes(1); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * expect(mockFn).toHaveReturnedTimes(2); // Fails if the function returned fewer or more times
 * ```
 *
 * @since 1.0.0
 */

export function toHaveReturnedTimes(this: MatcherService<MockStateInterface>, expected: number): void {
    const expectedLabels = [ 'expected' ];
    ensureMock.call(this, expectedLabels);
    ensurePositiveNumber.call(this, expected, 'expected', expectedLabels);

    const count = this.received.mock.calls.length;
    const resultsCount = this.received.mock.results.reduce(
        (n: number, result: MockInvocationResultInterface<unknown>) => result.type === 'return' ? n + 1 : n,
        0
    );

    handleFailure.call(this, {
        expectedLabels,
        pass: resultsCount == expected,
        expected: expected,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`Expected returns: != ${ EXPECTED(expected.toString()) }`);
            info.push(`Calls:               ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected returns: ${ EXPECTED(expected.toString()) }`);
            info.push(`Received returns: ${ RECEIVED(resultsCount.toString()) }`);
            info.push(`Calls:            ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that the last return value of a mock function matches the expected value.
 *
 * @param expected - The value expected to have been returned by the last invocation of the mock.
 *
 * @remarks
 * This matcher performs the following steps:
 * 1. Ensures `this.received` is a mock function using {@link ensureMock}.
 * 2. Collects all return values from the mock's results.
 * 3. Compares the last returned value to `expected` using deep equality via {@link equals}.
 * 4. Delegates assertion reporting to {@link handleFailure}, including serialized return values and call count.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(1);
 * mockFn(2);
 * expect(mockFn).toHaveLastReturnedWith(2); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn(1);
 * expect(mockFn).toHaveLastReturnedWith(2); // Fails
 * ```
 *
 * @since 1.0.0
 */

export function toHaveLastReturnedWith(this: MatcherService<MockStateInterface>, expected: unknown): void {
    const expectedLabels = [ 'expected' ];
    ensureMock.call(this, expectedLabels);

    const results: Array<unknown> = [];
    const count = this.received.mock.calls.length;
    const resultsCount = this.received.mock.results.reduce(
        (n: number, result: MockInvocationResultInterface<unknown>) => {
            if (result.type === 'return') {
                results.push(result.value);

                return n + 1;
            }

            return n;
        },
        0
    );

    const result = results.at(-1);
    const pass = results.length > 0 && equals(expected, result);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        expected: expected,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`Expected returns: not ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push('Received returns:\n');
            info.push(serializeReturnList(expected, results, resultsCount));
            info.push(`\nCalls: ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(info) {
            info.push(`Expected returns: ${ EXPECTED(serializeOneLine(expected)) }`);
            if (results.length > 0) {
                info.push('Received returns:\n');
                info.push(serializeReturnList(expected, results, resultsCount));
            }

            info.push(`\nReturns: ${ RECEIVED(resultsCount.toString()) }`);
            info.push(`Calls:   ${ RECEIVED(count.toString()) }`);
        }
    });
}

/**
 * Asserts that a specific invocation of a mock function returned the expected value.
 *
 * @param nthCall - The 1-based index of the call to check.
 * @param expected - The value expected to have been returned by the `nthCall` invocation.
 *
 * @remarks
 * This matcher performs the following steps:
 * 1. Ensures `this.received` is a mock function using {@link ensureMock}.
 * 2. Validates that `nthCall` is a positive number using {@link ensurePositiveNumber}.
 * 3. Collects all return values from the mock's results.
 * 4. Compares the return value of the `nthCall` invocation to `expected` using deep equality via {@link equals}.
 * 5. Delegates assertion reporting to {@link handleFailure}, including serialized return values, the call index, and call count.
 *
 * @throws If `this.received` is not a mock function, {@link ensureMock} will throw.
 * @throws If `nthCall` is not a positive number, {@link ensurePositiveNumber} will throw.
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn('a');
 * mockFn('b');
 * expect(mockFn).toHaveNthReturnedWith(2, 'b'); // Passes
 * ```
 *
 * @example
 * ```ts
 * const mockFn = xJet.fn();
 * mockFn('a');
 * expect(mockFn).toHaveNthReturnedWith(2, 'b'); // Fails, only one call
 * ```
 *
 * @since 1.0.0
 */

export function toHaveNthReturnedWith(this: MatcherService<MockStateInterface>, nthCall: number, expected: unknown): void {
    const expectedLabels = [ 'nthCall', 'expected' ];
    ensureMock.call(this, expectedLabels);
    ensurePositiveNumber.call(this, nthCall, 'nthCall', expectedLabels);

    const results: Array<unknown> = [];
    const count = this.received.mock.calls.length;
    const resultsCount = this.received.mock.results.reduce(
        (n: number, result: MockInvocationResultInterface<unknown>) => {
            if (result.type === 'return') {
                results.push(result.value);

                return n + 1;
            }

            return n;
        },
        0
    );

    const result = results.at(nthCall - 1);
    const pass = nthCall <= results.length && equals(expected, result);

    handleFailure.call(this, {
        pass,
        expectedLabels,
        expected: expected,
        receivedLabeled: this.received.name,
        handleNot(info) {
            info.push(`nthCall: ${ nthCall }`);
            info.push(`Expected returns: not ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push('Received returns:\n');
            info.push(serializeReturnList(expected, results, nthCall));
            info.push(`\nReturns: ${ RECEIVED(resultsCount.toString()) }`);
            info.push(`Calls:   ${ RECEIVED(count.toString()) }`);
        },
        handleInfo(info) {
            info.push(`nthCall: ${ nthCall }`);
            info.push(`Expected returns: ${ EXPECTED(serializeOneLine(expected)) }`);
            info.push('Received returns:\n');
            info.push(serializeReturnList(expected, results, nthCall));

            info.push(`\nReturns: ${ RECEIVED(resultsCount.toString()) }`);
            info.push(`Calls:   ${ RECEIVED(count.toString()) }`);
        }
    });
}
