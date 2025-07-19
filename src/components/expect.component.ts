
import type { BoundMatchersType } from '@components/interfaces/matchers-component.interface';
import { Matchers } from '@providers/matchers.provider';
import { Patterns } from '@providers/patterns.provider';
import { MatcherService } from '@services/matcher.service';


for (const key of Object.keys(Matchers) as Array<keyof typeof Matchers>) {
    const matcherFn = Matchers[key];

    Object.defineProperty(MatcherService.prototype, key, {
        value: function (...args: Array<unknown>) {
            return this.invoke(key, matcherFn, ...args);
        }
    });
}

const coreExpect = (actual: unknown, ...rest: Array<never>): MatcherService & BoundMatchersType => {
    if (rest.length > 0) {
        throw new Error(`Expect takes at most one argument. Received ${ rest.length + 1 } arguments instead.`);
    }

    return new MatcherService(actual) as MatcherService & BoundMatchersType;
};

export const expect = Object.assign(coreExpect, Patterns);
