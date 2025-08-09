/**
 * Abstract base class for asymmetric matchers with support for inversion logic.
 *
 * Provides a foundation for matchers that can optionally invert their match results.
 * Includes a name identifier and a flag indicating whether to invert the match outcome.
 *
 * @param name - The name of the pattern, used for identification or debugging
 * @param isInverse - If true, the match result is inverted; defaults to false
 *
 * @remarks
 * Subclasses must implement the `matches` method to perform the matching logic and
 * the `expectedLabel` getter to provide a label describing the expected pattern.
 *
 * The protected method `applyInverse` applies inversion to the boolean result based
 * on the `isInverse` flag.
 *
 * @since 1.0.0
 */

export abstract class AbstractPattern {
    /**
     * Creates an instance of the pattern with a name and optional inversion flag.
     *
     * @param name - The name of the pattern, used for identification or debugging
     * @param isInverse - Indicates whether the match result should be inverted (default is false)
     *
     * @since 1.0.0
     */

    protected constructor(public readonly name: string, public readonly isInverse = false) {
    }

    /**
     * Determines whether the received value matches this pattern.
     *
     * @param received - The value to test against the pattern
     * @returns True if the value matches the pattern (after applying inversion if enabled)
     *
     * @since 1.0.0
     */

    abstract matches(received: unknown): boolean;

    /**
     * A label describing the expected pattern, used in error messages or debugging.
     *
     * @since 1.0.0
     */

    abstract get expectedLabel(): string;

    /**
     * Applies inversion logic to the given result based on the `isInverse` flag.
     *
     * @param result - The original match result
     * @returns The possibly inverted match result
     *
     * @since 1.0.0
     */

    protected applyInverse(result: boolean): boolean {
        return this.isInverse ? !result : result;
    }
}
