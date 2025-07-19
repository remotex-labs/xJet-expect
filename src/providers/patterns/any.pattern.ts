/**
 * Import will remove at compile time
 */

import type { ConstructorType } from '@interfaces/function.interface';

/**
 * Imports
 */

import { AbstractPattern } from '@patterns/abstract.pattern';

export class AnyPattern extends AbstractPattern {
    private static readonly TYPE_CHECKS: Record<string, (value: unknown) => boolean> = {
        String: (actual) => typeof actual === 'string' || actual instanceof String,
        Number: (actual) => typeof actual === 'number' || actual instanceof Number,
        Function: (actual) => typeof actual === 'function' || actual instanceof Function,
        Boolean: (actual) => typeof actual === 'boolean' || actual instanceof Boolean,
        BigInt: (actual) => typeof actual === 'bigint' || actual instanceof BigInt,
        Symbol: (actual) => typeof actual === 'symbol' || actual instanceof Symbol,
        Object: (actual) => typeof actual === 'object',
        Array: Array.isArray
    };

    private constructor(protected sample: ConstructorType) {
        super();
    }

    static create(sample: ConstructorType): AnyPattern {
        if (sample === undefined) {
            throw new TypeError(
                'any() expects to be passed a constructor function. ' +
                'Please pass one or use anything() to match any object.'
            );
        }

        return new AnyPattern(sample);
    }

    matches(actual: unknown): boolean {
        if (this.sample.name in AnyPattern.TYPE_CHECKS) {
            return AnyPattern.TYPE_CHECKS[this.sample.name](actual);
        }

        // Fall back to instanceof check for other constructors
        return actual instanceof this.sample;
    }

    expectedString(): string {
        return `Any<${ this.sample.name }>`;
    }
}
