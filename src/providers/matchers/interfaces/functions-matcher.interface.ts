/**
 * Import will remove at compile time
 */

import type { HandleInfoType, HandleNotType } from '@handlers/interfaces/matchers-handler.interface';

/**
 * Base interface for thrown values in matchers.
 *
 * @remarks
 * Contains common fields used by all thrown types, including a message,
 * a flag indicating if the value has a message, and the serialized error.
 *
 * @since 1.0.0
 */

export interface BaseThrownInterface {
    /**
     * The error message associated with the thrown value.
     *
     * @since 1.0.0
     */

    message: string;

    /**
     * Whether the thrown value contains a message.
     *
     * @since 1.0.0
     */

    hasMessage: boolean;

    /**
     * The serialized version of the thrown value, useful for diffing and reporting.
     *
     * @since 1.0.0
     */

    serializedError: unknown;
}

/**
 * Represents a thrown JavaScript Error in matcher assertions.
 *
 * @extends BaseThrownInterface
 *
 * @remarks
 * Used when the thrown value is an actual `Error` instance.
 *
 * @since 1.0.0
 */

export interface ThrownErrorInterface extends BaseThrownInterface {
    /**
     * The actual Error instance.
     *
     * @since 1.0.0
     */

    value: Error;

    /**
     * Always `true` for error instances.
     *
     * @since 1.0.0
     */

    isError: true;

    /**
     * Always `true` for error instances.
     *
     * @since 1.0.0
     */

    hasMessage: true;
}

/**
 * Represents a thrown non-Error value in matcher assertions.
 *
 * @extends BaseThrownInterface
 *
 * @remarks
 * Used when the thrown value is not an `Error`, e.g., a string, number, or object.
 *
 * @since 1.0.0
 */

export interface ThrownObjectInterface extends BaseThrownInterface {
    /**
     * The actual thrown value (can be any type).
     *
     * @since 1.0.0
     */

    value: unknown;

    /**
     * Always `false` for non-error values.
     *
     * @since 1.0.0
     */

    isError: false;
}

/**
 * Union type representing all possible thrown values in matchers.
 *
 * @remarks
 * Can be either a {@link ThrownErrorInterface} or a {@link ThrownObjectInterface}.
 *
 * @see ThrownErrorInterface
 * @see ThrownObjectInterface
 *
 * @since 1.0.0
 */

export type ThrownType = ThrownErrorInterface | ThrownObjectInterface;

/**
 * Tuple representing a thrown value along with handler functions.
 *
 * @remarks
 * Format: `[hasThrown, handleNot, handleInfo]`.
 *
 * @see HandleNotType
 * @see HandleInfoType
 *
 * @since 1.0.0
 */

export type ThrownValueType = [ boolean, HandleNotType, HandleInfoType ];
