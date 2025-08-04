import { AbstractPattern } from '@patterns/abstract.pattern';

export class StringMatchingPattern extends AbstractPattern {
    private constructor(inverse: boolean, expected: string | RegExp) {
        super();
    }

    static create(inverse: boolean, expected: string | RegExp): StringMatchingPattern {
        return new StringMatchingPattern(inverse, expected);
    }

    matches(actual: unknown): boolean {
        throw new Error('Method not implemented.');
    }

    expectedString(): string {
        throw new Error('Method not implemented.');
    }
}
