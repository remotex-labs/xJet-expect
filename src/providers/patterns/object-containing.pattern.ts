import { AbstractPattern } from '@patterns/abstract.pattern';

export class ObjectContainingPattern extends AbstractPattern {
    private constructor(inverse: boolean, sample: Record<string, unknown>) {
        super();
    }

    static create(inverse: boolean, sample: Record<string, unknown>): ObjectContainingPattern {
        return new ObjectContainingPattern(inverse, sample);
    }

    matches(actual: unknown): boolean {
        throw new Error('Method not implemented.');
    }

    expectedString(): string {
        throw new Error('Method not implemented.');
    }
}
