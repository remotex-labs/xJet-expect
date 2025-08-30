/**
 * Import will remove at compile time
 */

import type { FunctionType } from '@interfaces/functions.interface';
import type { PromisifiedMatchersType } from '@interfaces/matchers.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { RECEIVED } from '@components/color.component';
import { xJetPromiseError } from '@errors/promise.error';
import { isPromise } from '@components/promise.component';
import { getType } from '@diff/components/diff.component';

/**
 * Service class for managing matcher assertions with support for modifiers and async handling.
 *
 * @template T - Type of the value being tested.
 *
 * @remarks
 * This class provides the core logic for matcher evaluation in the xJet framework,
 * including support for `.not`, `.resolves`, and `.rejects` modifiers.
 * It handles synchronous and asynchronous matcher invocation, promise validation,
 * and error throwing with detailed context.
 *
 * Internally tracks an assertion chain for composing error messages.
 *
 * @example
 * ```ts
 * await xExpect(promiseValue).resolves.toBe(expectedValue)
 * ```
 *
 * @since 1.0.0
 */

export class MatcherService<T = unknown> {
    /**
     * The name of the matcher or assertion that was invoked.
     *
     * @since 1.0.0
     */

    macherName: string = '';

    /**
     * Indicates if the matcher is dealing with a promise resolution or rejection.
     *
     * @internal
     * @since 1.0.0
     */

    protected promise?: 'resolves' | 'rejects';

    /**
     * Tracks whether the `.not` modifier has been applied.
     *
     * @internal
     * @since 1.0.0
     */

    protected notModifier: boolean = false;

    /**
     * Chains the sequence of assertions and modifiers applied.
     *
     * @internal
     * @since 1.0.0
     */

    protected assertionChain: Array<string> = [];

    /**
     * Tracks if the `.rejects` modifier has been applied.
     *
     * @internal
     * @since 1.0.0
     */

    protected rejectsModifier: boolean = false;

    /**
     * Tracks if the `.resolves` modifier has been applied.
     *
     * @internal
     * @since 1.0.0
     */

    protected resolvesModifier: boolean = false;

    /**
     * Creates a new MatcherService instance for the received value.
     *
     * @param received - The value or function under test.
     *
     * @since 1.0.0
     */

    constructor(protected received: T) {
    }

    /**
     * Applies the `.not` modifier, inverting matcher logic.
     *
     * @returns The matcher instance with `.not` applied, excluding chaining `.not`, `.rejects`, and `.resolves`.
     *
     * @since 1.0.0
     */

    get not(): Omit<this & PromisifiedMatchersType, 'not' | 'rejects' | 'resolved'> {
        this.notModifier = true;

        return <this & PromisifiedMatchersType>this;
    }


    /**
     * Applies the `.rejects` modifier, expecting the promise to reject.
     *
     * @throws Error - If `.resolves` was previously applied.
     *
     * @returns The matcher instance with `.rejects` applied, excluding chaining `.rejects` and `.resolves`.
     *
     * @since 1.0.0
     */

    get rejects(): Omit<PromisifiedMatchersType & this, 'rejects' | 'resolved'> {
        if (this.resolvesModifier) throw new Error('Cannot use "rejects" modifier after "resolved" modifier.');
        this.rejectsModifier = true;

        return <PromisifiedMatchersType & this>this;
    }

    /**
     * Applies the `.resolves` modifier, expecting the promise to resolve.
     *
     * @throws Error - If `.rejects` was previously applied.
     *
     * @returns The matcher instance with `.resolves` applied, excluding chaining `.rejects` and `.resolves`.
     *
     * @since 1.0.0
     */

    get resolves(): Omit<PromisifiedMatchersType & this, 'rejects' | 'resolved'> {
        if (this.rejectsModifier) throw new Error('Cannot use "resolved" modifier after "rejects" modifier.');
        this.resolvesModifier = true;

        return <PromisifiedMatchersType & this>this;
    }

    /**
     * Invokes the matcher synchronously or asynchronously based on modifiers.
     *
     * @param name - The matcher method name.
     * @param matcher - The matcher function to invoke.
     * @param args - Arguments to pass to the matcher.
     *
     * @returns Possibly a Promise resolving when async matchers are used, otherwise void.
     *
     * @since 1.0.0
     */

    protected invoke(name: string, matcher: FunctionType, args: Array<unknown>): void | Promise<void> {
        this.macherName = name;

        // todo remove invoke and invokeAsync from the stack
        if (this.rejectsModifier || this.resolvesModifier) {
            this.pushToChain(name);
            this.promise = this.resolvesModifier ? 'resolves' : 'rejects';

            return this.invokeAsync(matcher, args);
        }

        this.pushToChain(name);

        return matcher.call(this, ...args);
    }

    /**
     * Invokes the matcher asynchronously, handling promises and throwing detailed errors on mismatch.
     *
     * @param matcher - The matcher function to invoke.
     * @param args - Arguments to pass to the matcher.
     *
     * @throws xJetTypeError - If the received value or function result is not a Promise.
     * @throws xJetPromiseError - If the promise resolves or rejects contrary to the expected modifier.
     *
     * @returns A Promise resolving after matcher invocation.
     *
     * @since 1.0.0
     */

    protected async invokeAsync(matcher: FunctionType, args: Array<unknown>): Promise<void> {
        let isResolved = false;
        const isFunction = typeof this.received === 'function';
        const valueOrPromise = isFunction ? (this.received as FunctionType)() : this.received;

        if (!isPromise(valueOrPromise)) {
            throw new xJetTypeError({
                message: `${ RECEIVED('received') } value must be a promise or a function returning a promise`,
                assertionChain: this.assertionChain,
                received: {
                    type: getType(valueOrPromise),
                    value: valueOrPromise
                }
            });
        }

        try {
            this.received = <T> await valueOrPromise;
            isResolved = true;

        } catch (error) {
            if (this.resolvesModifier) this.throwPromiseError('Rejected', error);
            this.received = error as T;
        }

        if (isResolved && this.rejectsModifier) this.throwPromiseError('Resolved', this.received);

        return matcher.call(this, ...args);
    }

    /**
     * Adds modifiers and matcher name to the assertion chain for error message composition.
     *
     * @param name - The matcher method name to add.
     *
     * @internal
     * @since 1.0.0
     */

    private pushToChain(name: string): void {
        if (this.promise) this.assertionChain.push(this.promise);
        if (this.notModifier) this.assertionChain.push('not');
        this.assertionChain.push(name);
    }

    /**
     * Throws a detailed xJetPromiseError indicating promise resolution/rejection mismatch.
     *
     * @param kind - The kind of promise result encountered ('Resolved' or 'Rejected').
     * @param receivedValue - The actual resolved or rejected value.
     *
     * @throws xJetPromiseError
     *
     * @internal
     * @since 1.0.0
     */

    private throwPromiseError(kind: 'Resolved' | 'Rejected', receivedValue: unknown): never {
        const received = kind === 'Resolved' ? 'resolved' : 'rejected';
        const expected = kind === 'Resolved' ? 'rejected' : 'resolved';
        throw new xJetPromiseError({
            message: `${ RECEIVED('received') } promise ${ received } instead of ${ expected }`,
            received: receivedValue,
            promiseKind: kind,
            assertionChain: this.assertionChain
        });
    }
}
