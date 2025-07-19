/**
 * Represents a diff operation as a tuple where the first element is the operation type
 * and the second element is the affected text.
 *
 * @since 1.0.0
 */

export type DiffSegmentType = [ -1 | 0 | 1, string ];

/**
 * Defines the context for string difference calculations containing the
 * boundaries of the subsequences being compared and comparison functions.
 *
 * @since 1.0.0
 */

export interface ContextInterface {
    /**
     * Start index in the first sequence
     * @since 1.0.0
     */

    aStart: number;

    /**
     * Start index in the second sequence
     * @since 1.0.0
     */

    bStart: number;

    /**
     * End index (exclusive) in the first sequence
     * @since 1.0.0
     */

    aEnd: number;

    /**
     * End index (exclusive) in the second sequence
     * @since 1.0.0
     */

    bEnd: number;

    /**
     * Determines if characters at the given positions in both sequences match
     *
     * @param iA - Index in the first sequence
     * @param iB - Index in the second sequence
     * @returns True if the characters match, false otherwise
     *
     * @since 1.0.0
     */

    isMatch(iA: number, iB: number): boolean;

    /**
     * Processes a found common subsequence during diff operation.
     *
     * @param nCommon - Length of the common subsequence
     * @param aCommon - Starting index of the common subsequence in the first sequence
     * @param bCommon - Starting index of the common subsequence in the second sequence
     *
     * @remarks
     * This method is called when the diff algorithm identifies matching elements between
     * the two sequences. It's responsible for recording these matches and potentially
     * converting them into diff operations (equal segments).
     *
     * The implementation should handle the common subsequence appropriately in the context
     * of the overall diff calculation, typically by creating equal segments or by
     * updating internal state tracking matched regions.
     *
     * @since 1.0.0
     */

    foundSubsequence(nCommon: number, aCommon: number, bCommon: number): void;
}
