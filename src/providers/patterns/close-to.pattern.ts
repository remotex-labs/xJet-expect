import { AbstractPattern } from '@patterns/abstract.pattern';

export class CloseToPattern extends AbstractPattern {
    private constructor(inverse: boolean, expected: number, precision?: number) {
        super();
    }

    static create(inverse: boolean, expected: number, precision?: number): CloseToPattern {
        return new CloseToPattern(inverse, expected, precision);
    }

    matches(actual: unknown): boolean {
        throw new Error('Method not implemented.');
    }

    expectedString(): string {
        throw new Error('Method not implemented.');
    }
}
