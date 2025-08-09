/**
 * Import will remove at compile time
 */

import type { ComposeStatementInterface } from '@components/interfaces/format-component.interface';

/**
 * Represents the result of an assertion.
 *
 * @remarks
 * Contains optional fields such as the name of the assertion, pass/fail status,
 * failure message, expected value, received value, and any additional custom data.
 *
 * @since 1.0.0
 */

export interface AssertionResultInterface {
    /**
     * The name of the assertion.
     *
     * @since 1.0.0
     */

    name?: string;

    /**
     * Whether the assertion passed.
     *
     * @since 1.0.0
     */

    pass?: boolean;

    /**
     * The message describing assertion failure or details.
     *
     * @since 1.0.0
     */

    message?: string;

    /**
     * The expected value in the assertion.
     *
     * @since 1.0.0
     */

    expected?: unknown;

    /**
     * The received value in the assertion.
     *
     * @since 1.0.0
     */

    received?: unknown;

    /**
     * Additional custom properties related to the assertion result.
     *
     * @since 1.0.0
     */

    [key: string]: unknown;
}

/**
 * Options for configuring an expected error assertion, extending statement composition options.
 *
 * @remarks
 * Includes optional informational strings and an optional assertion result.
 *
 * @since 1.0.0
 */

export interface OptionsExpectErrorInterface extends ComposeStatementInterface {
    /**
     * Additional informational strings related to the error.
     *
     * @since 1.0.0
     */

    info?: Array<string>;

    /**
     * The assertion result associated with the error.
     *
     * @since 1.0.0
     */

    assertion?: AssertionResultInterface;
}
