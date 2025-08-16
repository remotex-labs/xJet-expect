/**
 * Options for composing an xJet matcher statement string.
 *
 * @since 1.0.0
 */

export interface ComposeStatementInterface {
    /**
     * Optional trailing comment appended after the statement.
     * @since 1.0.0
     */

    comment?: string;

    /**
     * Non-empty array representing the chain of matcher methods
     * (e.g., ['rejects', 'toThrow']).
     *
     * @since 1.0.0
     */

    assertionChain: Array<string>;

    /**
     * Array of expected argument labels
     * (e.g., ['expectedValue', 'anotherValue']).
     *
     * @since 1.0.0
     */

    expectedLabels?: Array<string>;

    /**
     * Label for the received value inside `expect()` (e.g., 'received').
     *
     * @default 'received'
     *
     * @since 1.0.0
     */

    receivedLabeled?: string;
}
