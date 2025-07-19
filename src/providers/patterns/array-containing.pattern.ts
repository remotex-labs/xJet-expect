import { AbstractPattern } from '@patterns/abstract.pattern';

export class ArrayContainingPattern extends AbstractPattern {
    private constructor(inverse: boolean, sample: Array<unknown>) {
        super();
    }

    static create(inverse: boolean, sample: Array<unknown>): ArrayContainingPattern {
        return new ArrayContainingPattern(inverse, sample);
    }

    matches(actual: unknown): boolean {
        throw new Error('Method not implemented.');
    }

    expectedString(): string {
        throw new Error('Method not implemented.');
    }
}
