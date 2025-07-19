import type { AssertionResultInterface } from '@errors/interfaces/assertion-error.interface';

export class AssertionError extends Error {
    matcherResult?: AssertionResultInterface;

    constructor(message: string, matcherResult?: AssertionResultInterface) {
        super(message);
        this.name = 'xJetAssertion';

        if (matcherResult) {
            this.matcherResult = matcherResult;
        }

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AssertionError);
        }
    }
}
