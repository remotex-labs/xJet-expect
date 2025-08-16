/**
 * Represents the possible outcomes of a mock function invocation.
 *
 * - `'return'` — The mock function returned a value.
 * - `'throw'` — The mock function threw an error.
 * - `'incomplete'` — The mock function call has not yet completed.
 *
 * @remarks
 * Indicates whether a mock function call returned a value, threw an error,
 * or is still incomplete. Used internally to track mock call behavior.
 *
 * @since 1.0.0
 */

export type MockInvocationResultType = 'return' | 'throw' | 'incomplete';

/**
 * Describes the result of a single mock function invocation.
 *
 * @typeParam T - The type of the returned value when the invocation is successful.
 *
 * @property type - The type of result (`'return'`, `'throw'`, or `'incomplete'`).
 * @property value - The returned value, thrown error, or `undefined`.
 *
 * @remarks
 * Stores both the type of outcome (`'return'`, `'throw'`, or `'incomplete'`)
 * and the associated value. The `value` can be the returned value, an error,
 * `undefined`, or any other unknown type.
 *
 * @since 1.0.0
 */

export interface MockInvocationResultInterface<T> {
    /**
     * The type of invocation result.
     *
     * @since 1.0.0
     */

    type: MockInvocationResultType;

    /**
     * The returned value, thrown error, `undefined`, or any other unknown type.
     *
     * @since 1.0.0
     */

    value: T | (unknown & { type?: never }) | undefined | unknown;
}

/**
 * Holds the state for all invocations of a single mock function.
 *
 * @typeParam ReturnType - The return type of the mock function.
 * @typeParam Args - The argument types of the mock function.
 * @typeParam Context - The `this` context type used when the function is called.
 *
 * @remarks
 * Tracks arguments, return values, thrown errors, `this` contexts, and call order
 * for all invocations of the mock function. Also records instances if used as a constructor.
 *
 * @since 1.0.0
 */

export interface MocksStateInterface<ReturnType, Args extends Array<unknown>, Context = unknown> {
    /**
     * The list of argument arrays from each invocation.
     *
     * @since 1.0.0
     */

    calls: Array<Args>;

    /**
     * The arguments from the most recent invocation.
     *
     * @since 1.0.0
     */

    lastCall?: Args;

    /**
     * The `this` context values from each invocation.
     *
     * @since 1.0.0
     */

    contexts: Array<Context>;

    /**
     * The list of constructed instances when the mock is used as a constructor.
     *
     * @since 1.0.0
     */

    instances: Array<Context>;

    /**
     * The order in which each call was invoked across all mocks.
     *
     * @since 1.0.0
     */

    invocationCallOrder: Array<number>;

    /**
     * The results of each invocation, including return values and thrown errors.
     *
     * @since 1.0.0
     */

    results: Array<MockInvocationResultInterface<ReturnType>>;
}

/**
 * Describes the state and metadata of a mock function.
 *
 * @property name - The display name of the mock function.
 * @property xJetMock - A flag indicating that this function is an `xJet` mock.
 * @property mock - The internal state tracking all invocations and results.
 *
 * @remarks
 * Stores the mock’s display name, a flag indicating whether it is an `xJet` mock,
 * and its associated invocation history and results.
 *
 * @since 1.0.0
 */

export interface MockStateInterface {
    /**
     * The display name of the mock function.
     *
     * @since 1.0.0
     */

    name: string;

    /**
     * Whether this mock was created by the `xJet` mocking system.
     *
     * @since 1.0.0
     */

    xJetMock: boolean;

    /**
     * The internal state object containing call and result history.
     *
     * @see MocksStateInterface
     * @since 1.0.0
     */

    mock: MocksStateInterface<unknown, Array<unknown>>;
}
