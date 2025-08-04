export abstract class AbstractPattern {
    protected constructor() {}

    abstract matches(actual: unknown): boolean;
    abstract expectedString(): string;
}
