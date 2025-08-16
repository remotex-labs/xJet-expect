/**
 * Import will remove at compile time
 */

import type { ComposeStatementInterface } from '@components/interfaces/format-component.interface';

/**
 * Describes a value's type and its actual value.
 *
 * @remarks
 * Used to provide detailed type and value information for error reporting.
 *
 * @since 1.0.0
 */

export interface TypeInfoInterface {
    /**
     * The type name of the value (e.g., "string", "number").
     *
     * @since 1.0.0
     */

    type?: string;

    /**
     * The actual value.
     *
     * @since 1.0.0
     */

    value: unknown;
}

/**
 * Options used to configure an xJetTypeError.
 *
 * @remarks
 * Extends ComposeStatementInterface with properties to specify
 * the error message, expected value details, and received value details.
 *
 * @see ComposeStatementInterface
 * @see TypeInfoInterface
 * @since 1.0.0
 */

export interface OptionsTypeErrorInterface extends ComposeStatementInterface {
    /**
     * The error message describing the type mismatch or validation failure.
     *
     * @since 1.0.0
     */

    message: string;

    /**
     * Information about the expected value, including its type and value.
     *
     * @since 1.0.0
     */

    expected?: TypeInfoInterface;

    /**
     * Information about the received value, including its type and value.
     *
     * @since 1.0.0
     */

    received?: TypeInfoInterface;
}
