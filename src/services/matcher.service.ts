/**
 * Import will remove at compile time
 */

import type { FunctionType } from '@interfaces/function.interface';
import type { PromisifiedMatchersType } from '@interfaces/matchers.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { RECEIVED } from '@components/color.component';
import { xJetPromiseError } from '@errors/promise.error';
import { isPromise } from '@components/promise.component';
import { getType } from '@diff/components/diff.component';


export class MatcherService {
    protected promise?: 'resolves' | 'rejects';
    protected hintChain: Array<string> = [];
    protected notModifiers: boolean = false;
    protected rejectsModifiers: boolean = false;
    protected resolvesModifiers: boolean = false;

    constructor(protected actual: unknown) {
    }

    get not(): Omit<this & PromisifiedMatchersType, 'not' | 'rejects' | 'resolved'> {
        this.notModifiers = true;

        return <this & PromisifiedMatchersType> this;
    }

    get rejects(): Omit<PromisifiedMatchersType & this, 'rejects' | 'resolved'> {
        if (this.resolvesModifiers) throw new Error('Cannot use "rejects" modifier after "resolved" modifier.');
        this.rejectsModifiers = true;

        return <PromisifiedMatchersType & this> this;
    }

    get resolves(): Omit<PromisifiedMatchersType & this, 'rejects' | 'resolved'> {
        if (this.rejectsModifiers) throw new Error('Cannot use "resolved" modifier after "rejects" modifier.');
        this.resolvesModifiers = true;

        return <PromisifiedMatchersType & this> this;
    }

    protected invoke(name: string, matcher: FunctionType, args: Array<unknown>): void | Promise<void> {
        // todo remove invoke and invokeAsync from the stack
        if(this.rejectsModifiers || this.resolvesModifiers) {
            return this.invokeAsync(name, matcher, args);
        }

        if(this.notModifiers) this.hintChain.push('not');
        this.hintChain.push(name);

        return matcher.call(this, ...args);
    }

    protected async invokeAsync(name: string, matcher: FunctionType, args: Array<unknown>): Promise<void> {
        this.promise = this.resolvesModifiers ? 'resolves' : 'rejects';
        if(this.promise) this.hintChain.push(this.promise);
        if(this.notModifiers) this.hintChain.push('not');
        this.hintChain.push(name);

        const isFunction = typeof this.actual === 'function';
        const valueOrPromise = isFunction ? (this.actual as FunctionType)() : this.actual;

        let isResolved = false;
        if (!isPromise(valueOrPromise)) {
            throw new xJetTypeError({
                hintChain: this.hintChain,
                message: `${ RECEIVED('received') } value must be a promise or a function returning a promise`,
                received: {
                    type: getType(valueOrPromise),
                    value: valueOrPromise
                }
            });
        }

        try {
            this.actual = await valueOrPromise;
            isResolved = true;
        } catch(error) {
            if(this.resolvesModifiers) {
                throw new xJetPromiseError({
                    hintChain: this.hintChain,
                    message: `${ RECEIVED('received') } promise rejected instead of resolved`,
                    value: error,
                    valueKind: 'Rejected'
                });
            }

            this.actual = error;
        }

        if(isResolved && this.rejectsModifiers) {
            throw new xJetPromiseError({
                hintChain: this.hintChain,
                message: `${ RECEIVED('received') } promise resolved instead of rejected`,
                value: this.actual,
                valueKind: 'Resolved'
            });
        }

        return matcher.call(this, args);
    }
}
