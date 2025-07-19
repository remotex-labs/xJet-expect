import type { FunctionType } from '@interfaces/function.interface';
import type { PromisifiedMatchersType } from '@components/interfaces/matchers-component.interface';

import { AssertionError } from '@errors/assertion.error';
import { isPromise } from '@components/promise.component';
import { RECEIVED_COLOR } from '@services/format.service';
import { formatHint, formatReceived, formatWithType, formatErrorMessage } from '@services/format.service';

export class MatcherService {
    protected promise?: string;
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
        if(this.rejectsModifiers || this.resolvesModifiers) {
            return this.invokeAsync(name, matcher, args);
        }

        return matcher.call(this, args);
    }

    protected async invokeAsync(name: string, matcher: FunctionType, args: Array<unknown>): Promise<void> {
        this.promise = this.resolvesModifiers ? 'resolves' : 'rejects';
        const valueOrPromise = typeof this.actual === 'function'
            ? (this.actual as FunctionType)()
            : this.actual;

        const hint = formatHint(name, undefined, '', {
            isNot: this.notModifiers,
            promise: this.promise
        });

        let isResolved = false;
        if (!isPromise(valueOrPromise)) { // todo check if set reject to resolve
            const specific = formatWithType('Received', this.actual, formatReceived);
            const generic = `${ RECEIVED_COLOR('received') } value must be a promise or a function returning a promise`;

            throw new AssertionError(formatErrorMessage(hint, generic, 'Matcher error', specific));
        }

        try {
            this.actual = await valueOrPromise;
            isResolved = true;
        } catch(error) {
            if(this.resolvesModifiers) {
                const message = 'Received promise rejected instead of resolved';
                throw new AssertionError(
                    formatErrorMessage(hint, `${ message }\nRejected value: ${ error }`)
                );
            }

            this.actual = error;
        }

        if(isResolved && this.rejectsModifiers) {
            const message = 'Received promise resolved instead of rejected';
            throw new AssertionError(
                formatErrorMessage(hint, `${ message }\nResolved value: ${ this.actual }`)
            );
        }

        return matcher.call(this, args);
    }
}
