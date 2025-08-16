/**
 * Import will remove at compile time
 */

import type { ComposeStatementInterface } from '@components/interfaces/format-component.interface';

/**
 * Options used to configure an xJetPromiseError.
 *
 * @remarks
 * Extends ComposeStatementInterface with properties to specify
 * the error message, the received promise value, and whether
 * it was resolved or rejected.
 *
 * @since 1.0.0
 */

export interface OptionsPromiseErrorInterface extends ComposeStatementInterface {
    /**
     * The error message describing the failure.
     *
     * @since 1.0.0
     */

    message: string;

    /**
     * The received promise value that caused the error.
     *
     * @since 1.0.0
     */

    received: unknown;

    /**
     * The kind of promise received, used for styling the error message.
     *
     * @since 1.0.0
     */

    promiseKind: 'Resolved' | 'Rejected';
}
