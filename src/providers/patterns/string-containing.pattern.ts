import { AbstractPattern } from '@patterns/abstract.pattern';

export class StringContainingPattern extends AbstractPattern {
    private constructor(inverse: boolean, expected: string) {
        super();
    }

    static create(inverse: boolean, expected: string): StringContainingPattern {
        return new StringContainingPattern(inverse, expected);
    }

    matches(actual: unknown): boolean {
        throw new Error('Method not implemented.');
    }

    expectedString(): string {
        throw new Error('Method not implemented.');
    }
}
