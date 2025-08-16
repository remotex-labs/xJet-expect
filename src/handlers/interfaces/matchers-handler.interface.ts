/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';
import type { ComposeStatementInterface } from '@components/interfaces/format-component.interface';

/**
 * Options for handling a matcher failure during assertion evaluation.
 *
 * @remarks
 * Extends ComposeStatementInterface (excluding assertionChain) with
 * properties to indicate pass/fail status, matcher name, expected value,
 * and optional handlers for "not" and info messages.
 *
 * The handlers, if provided, are called with context bound to the MatcherService instance
 * and receive an array of string info messages.
 *
 * @since 1.0.0
 */

export interface HandleFailureInterface extends Omit<ComposeStatementInterface, 'assertionChain'> {
    /**
     * Indicates whether the assertion passed or failed.
     *
     * @since 1.0.0
     */

    pass: boolean;

    /**
     * The expected value for comparison, if applicable.
     *
     * @since 1.0.0
     */

    expected?: unknown;

    /**
     * Optional handler to process "not" modifier info during failure handling.
     *
     * Bound to the MatcherService instance when called.
     *
     * @param info - Array of info strings related to the failure.
     *
     * @since 1.0.0
     */

    handleNot?(this: MatcherService, info: Array<string>): void;

    /**
     * Optional handler to process additional info during failure handling.
     *
     * Bound to the MatcherService instance when called.
     *
     * @param info - Array of info strings related to the failure.
     *
     * @since 1.0.0
     */

    handleInfo?(this: MatcherService, info: Array<string>): void;
}

/**
 * Type alias for the `handleNot` method from {@link HandleFailureInterface}.
 *
 * @see HandleFailureInterface
 *
 * @since 1.0.0
 */

export type HandleNotType = HandleFailureInterface['handleNot'];

/**
 * Type alias for the `handleInfo` method from {@link HandleFailureInterface}.
 *
 * @see HandleFailureInterface
 *
 * @since 1.0.0
 */

export type HandleInfoType = HandleFailureInterface['handleInfo'];

/**
 * Options for handling a matcher failure with diff information.
 *
 * @remarks
 * Extends HandleFailureInterface (excluding the default handleNot and handleInfo)
 * adding an optional note property. Overrides optional handlers to be
 * bound to MatcherService instance and receive info messages.
 *
 * @since 1.0.0
 */

export interface HandleDiffFailureInterface extends Omit<HandleFailureInterface, 'handleNot' | 'handleInfo'> {
    /**
     * Optional note or additional message to accompany the failure.
     *
     * @since 1.0.0
     */

    note?: string;

    /**
     * Optional handler to process "not" modifier info during failure handling.
     *
     * Bound to the MatcherService instance when called.
     *
     * @param info - Array of info strings related to the failure.
     *
     * @since 1.0.0
     */

    handleNot?(this: MatcherService, info: Array<string>): void;

    /**
     * Optional handler to process additional info during failure handling.
     *
     * Bound to the MatcherService instance when called.
     *
     * @param info - Array of info strings related to the failure.
     *
     * @since 1.0.0
     */

    handleInfo?(this: MatcherService, info: Array<string>): void;
}
