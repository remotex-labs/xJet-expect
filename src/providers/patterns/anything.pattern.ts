import { AbstractPattern } from '@patterns/abstract.pattern';

export class AnythingPattern extends AbstractPattern {
    private constructor() {
        super();
    }

    static create(): AnythingPattern {
        return new AnythingPattern();
    }

    matches(actual: unknown): boolean {
        return actual != null;
    }

    expectedString(): string {
        return 'Anything';
    }
}
