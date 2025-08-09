/**
 * Import will remove at compile time
 */

import type { ContextInterface, DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';
import type { FoundSubsequenceType, IsMatchType } from '@diff/providers/interfaces/string-provider.interface';

/**
 * Enumeration of diff operation types representing delete, equal, and insert operations.
 *
 * @remarks
 * These values correspond to the standard diff operation convention:
 * - DELETE (-1): Content exists in the first sequence but not in the second.
 * - EQUAL (0): Content exists identically in both sequences.
 * - INSERT (1): Content exists in the second sequence but not in the first.
 *
 * @example
 * ```ts
 * const operation = DiffTypes.DELETE; // -1
 * const diffSegment = [DiffTypes.EQUAL, "shared text"]; // [0, "shared text"]
 * ```
 *
 * @since 1.0.0
 */

export const enum DiffTypes {
    DELETE = -1,
    EQUAL = 0,
    INSERT = 1,
}

/**
 * Counts the number of matching characters from the end positions of two sequences.
 *
 * @returns The count of matching characters in backward direction
 *
 * @remarks
 * This function works backwards from the end boundaries of both sequences
 * to find common suffix text. It is used to optimize the diff algorithm
 * by identifying and handling common suffixes separately.
 *
 * @example
 * ```ts
 * const context = {
 *   aStart: 0, aEnd: text1.length,
 *   bStart: 0, bEnd: text2.length,
 *   isMatch: (i, j) => text1[i] === text2[j]
 * };
 * const suffixLength = countCommonBackward.call(context);
 * ```
 *
 * @since 1.0.0
 */

function countCommonForward(this: ContextInterface): number {
    let count = 0;
    while (
        this.aStart + count < this.aEnd &&
        this.bStart + count < this.bEnd &&
        this.isMatch(this.aStart + count, this.bStart + count)
    ) {
        count++;
    }

    return count;
}

/**
 * Counts the number of matching characters from the end positions of two sequences.
 *
 * @returns The count of matching characters in backward direction
 *
 * @remarks
 * This function works backwards from the end boundaries of both sequences
 * to find common suffix text. It continues counting as long as characters match,
 * and the indices remain within the valid sequence bounds.
 *
 * @example
 * ```ts
 * const context = {
 *   aStart: 0, aEnd: text1.length,
 *   bStart: 0, bEnd: text2.length,
 *   isMatch: (i, j) => text1[i] === text2[j]
 * };
 * const suffixLength = countCommonBackward.call(context);
 * ```
 *
 * @since 1.0.0
 */

function countCommonBackward(this: ContextInterface): number {
    let count = 0;
    while (
        this.aEnd - 1 - count >= this.aStart &&
        this.bEnd - 1 - count >= this.bStart &&
        this.isMatch(this.aEnd - 1 - count, this.bEnd - 1 - count)
    ) {
        count++;
    }

    return count;
}

/**
 * Reconstructs the edit path from the trace matrix created during the Myers diff algorithm execution.
 *
 * @param trace - Array of vectors storing the x coordinates for each diagonal at each edit distance
 * @param offset - Offset value for indexing into the vectors (typically max edit distance)
 * @param dFinal - The final edit distance at which the end point was found
 *
 * @remarks
 * This function works by backtracking through the trace matrix, starting from the endpoint and
 * following the path back to the start. It reconstructs the sequence of operations (inserts,
 * deletes, and equals) needed to transform the first sequence into the second sequence.
 *
 * The backtracking process involves determining whether horizontal, vertical, or diagonal
 * movements were made in the edit graph, corresponding to insertions, deletions, or matches
 * respectively.
 *
 * @example
 * ```ts
 * const context = {
 *   aStart: 0, aEnd: textA.length,
 *   bStart: 0, bEnd: textB.length,
 *   isMatch: (i, j) => textA[i] === textB[j],
 *   foundSubsequence: (n, aIdx, bIdx) => { \/* handle subsequence *\/ }
 * };
 *
 * // During findMiddleSnake:
 * backtrackFlat.call(context, trace, max, dFinal);
 * ```
 *
 * @see findMiddleSnake
 * @see diffSequence
 *
 * @since 1.0.0
 */

function backtrackFlat(this: ContextInterface, trace: Array<number[]>, offset: number, dFinal: number): void {
    let x = this.aEnd - this.aStart;
    let y = this.bEnd - this.bStart;
    const result: Array<[ number, number, number ]> = [];

    for (let d = dFinal; d > 0; d--) {
        const vPrev = trace[d - 1];
        const k = x - y;

        let prevK: number;
        const kMinus = vPrev[k - 1 + offset];
        const kPlus = vPrev[k + 1 + offset];

        if (k === -d || (k !== d && kMinus < kPlus)) {
            prevK = k + 1;
        } else {
            prevK = k - 1;
        }

        const prevKIndex = prevK + offset;
        const prevX = vPrev[prevKIndex];
        const prevY = prevX - prevK;

        // Diagonal: matching characters
        while (x > prevX && y > prevY) {
            --x;
            --y;
            result.push([ 1, this.aStart + x, this.bStart + y ]);
        }

        if (x === prevX) {
            result.push([ 0, this.aStart + prevX, this.bStart + prevY ]);
        } else {
            result.push([ 0, this.aStart + prevX, this.bStart + prevY ]);
        }

        x = prevX;
        y = prevY;
    }

    for (const item of result.reverse()) {
        this.foundSubsequence(...item);
    }
}

/**
 * Implements the central part of Myers' diff algorithm by finding the middle snake of the shortest edit script.
 *
 * @remarks
 * This function implements the core of the Myers diff algorithm. It works by:
 * 1. Computing the length of both sequences
 * 2. Iterating through possible edit distances (d)
 * 3. For each d, computing the furthest reaching paths along each diagonal k
 * 4. When the paths from opposite directions meet, a middle snake is found
 * 5. Calling backtrackFlat to reconstruct the edit path when end point is reached
 *
 * The algorithm uses a "divide and conquer" approach to find the shortest edit script
 * between two sequences efficiently, with worst-case time complexity of O((n+m)D).
 *
 * @example
 * ```ts
 * const context = {
 *   aStart: 0, aEnd: text1.length,
 *   bStart: 0, bEnd: text2.length,
 *   isMatch: (i, j) => text1[i] === text2[j]
 * };
 * findMiddleSnake.call(context);
 * ```
 *
 * @see backtrackFlat
 * @see diffSequence
 *
 * @since 1.0.0
 */

function findMiddleSnake(this: ContextInterface): void {
    const n = this.aEnd - this.aStart;
    const m = this.bEnd - this.bStart;
    const max = n + m;

    let dFinal = 0;
    const v = new Array(2 * max + 1).fill(0);
    const trace: Array<number[]> = [];

    for (let d = 0; d <= max; d++) {
        const vCopy = new Array(2 * max + 1);
        trace[d] = vCopy;

        for (let k = -d; k <= d; k += 2) {
            const kIndex = k + max;

            let x: number;
            if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
                x = v[k + 1 + max];
            } else {
                x = v[k - 1 + max] + 1;
            }

            let y = x - k;
            while (x < n && y < m && this.isMatch(this.aStart + x, this.bStart + y)) {
                x++;
                y++;
            }

            v[kIndex] = x;
            vCopy[kIndex] = x;
            if (x >= n && y >= m) {
                dFinal = d;

                return backtrackFlat.call(this, trace, max, dFinal);
            }
        }
    }
}

/**
 * Performs a diff operation between two sequences by implementing an optimized Myers algorithm.
 *
 * @remarks
 * This function efficiently computes the differences between two sequences by:
 * 1. First identifying common prefix and suffix elements to reduce the problem size
 * 2. Handling the special case where sequences are fully equal
 * 3. Adjusting sequence boundaries to exclude common prefix/suffix
 * 4. Applying the Myers diff algorithm via findMiddleSnake to find the shortest edit path
 * 5. Reporting common subsequences through the context's foundSubsequence method
 *
 * This optimization significantly improves performance for sequences with common
 * prefixes or suffixes, which is a common case in many text diff scenarios.
 *
 * @example
 * ```ts
 * const context = {
 *   aStart: 0, aEnd: textA.length,
 *   bStart: 0, bEnd: textB.length,
 *   isMatch: (i, j) => textA[i] === textB[j],
 *   foundSubsequence: (n, aIdx, bIdx) => { \/* handle subsequence *\/ }
 * };
 * diffSequence.call(context);
 * ```
 *
 * @since 1.0.0
 */

export function diffSequence(this: ContextInterface): void {
    const prefixLen = countCommonForward.call(this);
    const isFullyEqual = this.aStart + prefixLen >= this.aEnd && this.bStart + prefixLen >= this.bEnd;
    if (prefixLen > 0) {
        this.foundSubsequence(prefixLen, this.aStart, this.bStart);

        if (isFullyEqual) {
            return;
        }
    }

    this.aStart += prefixLen;
    this.bStart += prefixLen;

    const suffixLen = countCommonBackward.call(this);
    this.aEnd -= suffixLen;
    this.bEnd -= suffixLen;
    if (this.aStart < this.aEnd || this.bStart < this.bEnd) {
        findMiddleSnake.call(this);
    }

    if (suffixLen > 0) {
        this.foundSubsequence(suffixLen, this.aEnd, this.bEnd);
    }
}

/**
 * Creates and executes a diff operation between two sequences of elements.
 *
 * @param aLength - Length of the first sequence
 * @param bLength - Length of the second sequence
 * @param isMatch - Function that determines if elements at specified positions match
 * @param foundSubsequence - Callback function that processes found common subsequences
 *
 * @remarks
 * This function serves as a convenient wrapper around the core diff algorithm.
 * It constructs a context object with the provided parameters and invokes the
 * diff sequence calculation. The results are reported through the foundSubsequence
 * callback as common subsequences are identified.
 *
 * The comparison is performed using the provided isMatch function, allowing
 * for custom equality logic between sequence elements.
 *
 * @example
 * ```ts
 * createDiff(
 *   textA.length,
 *   textB.length,
 *   (iA, iB) => textA[iA] === textB[iB],
 *   (nCommon, aCommon, bCommon) => {
 *     // Process the found common subsequence
 *   }
 * );
 * ```
 *
 * @see diffSequence
 * @see ContextInterface
 *
 * @since 1.0.0
 */

export function createDiff(
    aLength: number, bLength: number, isMatch: IsMatchType, foundSubsequence: FoundSubsequenceType
): void {
    const context: ContextInterface = {
        aStart: 0,
        bStart: 0,
        aEnd: aLength,
        bEnd: bLength,
        isMatch,
        foundSubsequence
    };

    diffSequence.call(context);
}

/**
 * Compares two strings and returns an array of diff operations.
 * Implements an optimized version of the Myers diff algorithm.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns Array of diff operations, where each operation is a tuple of [type, text]
 *
 * @throws Never throws exceptions but may produce unexpected results with invalid inputs
 *
 * @remarks
 * This function implements a highly optimized version of the Myers diff algorithm.
 * It efficiently finds the shortest edit script between two strings and
 * represents the differences as a series of delete, equal, and insert operations.
 *
 * @example
 * ```ts
 * const diff = diffStringsRaw('abc', 'abxc');
 * // Returns: [[0, 'ab'], [-1, 'c'], [1, 'xc']]
 * ```
 *
 * @see DiffSegmentType
 * @see ContextInterface
 * @since 1.0.0
 */

export function diffStringsRaw(a: string, b: string): Array<DiffSegmentType> {
    let aIndex = 0;
    let bIndex = 0;
    let pendingInsert = '';
    let pendingDelete = '';
    const diffs: Array<DiffSegmentType> = [];

    // Helper to merge with last diff if same type
    function pushDiff(type: DiffTypes, text: string): void {
        const last = diffs[diffs.length - 1];
        if (last && last[0] === type) {
            last[1] += text;
        } else {
            diffs.push([ type, text ]);
        }
    }

    createDiff(a.length, b.length, (iA: number, iB: number): boolean => {
        return a[iA] === b[iB];
    }, (nCommon: number, aCommon: number, bCommon: number): void => {
        if (aIndex !== aCommon) {
            pendingDelete += a.slice(aIndex, aCommon);
        }
        if (bIndex !== bCommon) {
            pendingInsert += b.slice(bIndex, bCommon);
        }

        if (nCommon > 0) {
            // Flush pending delete/insert together before equal
            if (pendingDelete) {
                pushDiff(DiffTypes.DELETE, pendingDelete);
                pendingDelete = '';
            }
            if (pendingInsert) {
                pushDiff(DiffTypes.INSERT, pendingInsert);
                pendingInsert = '';
            }

            // Push equal segment
            pushDiff(DiffTypes.EQUAL, b.slice(bCommon, bCommon + nCommon));
        }

        aIndex = aCommon + nCommon;
        bIndex = bCommon + nCommon;
    });

    // After the last common subsequence, push remaining change items.
    if (aIndex !== a.length) pendingDelete += a.slice(aIndex);
    if (bIndex !== b.length) pendingInsert += b.slice(bIndex);

    // Final flush
    if (pendingDelete) diffs.push([ DiffTypes.DELETE, pendingDelete ]);
    if (pendingInsert) diffs.push([ DiffTypes.INSERT, pendingInsert ]);

    return diffs;
}

/**
 * Compares two arrays of strings line by line and returns an array of diff operations.
 *
 * @param a - First array of strings (lines) to compare
 * @param b - Second array of strings (lines) to compare
 * @returns Array of diff operations, where each operation is a tuple of [type, text]
 *
 * @remarks
 * This function implements a line-by-line comparison algorithm that identifies differences
 * between two text arrays. The comparison is performed using strict equality between lines.
 *
 * The function produces a sequence of operations (delete, insert, equal) that represent
 * the minimal set of changes needed to transform the first array into the second array.
 * Each operation is represented as a tuple where:
 * - The first element is the operation type (-1 for delete, 0 for equal, 1 for insert)
 * - The second element is the affected line
 *
 * @example
 * ```ts
 * const result = diffLinesRaw(
 *   ['line 1', 'line 2', 'line 3'],
 *   ['line 1', 'new line', 'line 3']
 * );
 * // Returns: [[0, 'line 1'], [-1, 'line 2'], [1, 'new line'], [0, 'line 3']]
 * ```
 *
 * @see DiffTypes
 * @see DiffSegmentType
 *
 * @since 1.0.0
 */

export function diffLinesRaw(a: Array<string>, b: Array<string>): Array<DiffSegmentType> {
    let aIndex = 0;
    let bIndex = 0;
    const diffs: Array<DiffSegmentType> = [];

    createDiff(a.length, b.length, (iA: number, iB: number): boolean => {
        // Why do we do this?
        // When serializing objects, the last property does NOT have a trailing comma because that is a valid syntax.
        // For example,
        // { name: "ssss" }
        //
        // But if one object has an extra property, it will have a comma on the previous last property:
        // { name: "ssss", yyy: "sdx" }
        //
        // This means during diffing, one line might have a trailing comma and the other might not.
        // This causes false positives where the diff thinks lines differ when only the comma is missing.
        //
        // To fix this, if one line has a trailing comma but the other doesn't,
        // we add the missing comma to the line without it before comparing.
        // This normalizes the lines so the diff ignores trailing comma differences.

        const hasCommaA = a[iA].trimEnd().endsWith(',');
        const hasCommaB = b[iB].trimEnd().endsWith(',');

        if (hasCommaA && !hasCommaB) {
            b[iB] += ',';
        } else if (!hasCommaA && hasCommaB) {
            a[iA] += ',';
        }

        return a[iA] ===  b[iB];
    }, (nCommon: number, aCommon: number, bCommon: number): void => {
        for (; aIndex !== aCommon; aIndex += 1) {
            diffs.push([ DiffTypes.DELETE, a[aIndex] ]);
        }
        for (; bIndex !== bCommon; bIndex += 1) {
            diffs.push([ DiffTypes.INSERT, b[bIndex] ]);
        }
        for (; nCommon !== 0; nCommon -= 1, aIndex += 1, bIndex += 1) {
            diffs.push([ DiffTypes.EQUAL, b[bIndex] ]);
        }
    });

    // After the last common subsequence, push remaining change items.
    for (; aIndex !== a.length; aIndex += 1) {
        diffs.push([ DiffTypes.DELETE, a[aIndex] ]);
    }
    for (; bIndex !== b.length; bIndex += 1) {
        diffs.push([ DiffTypes.INSERT, b[bIndex] ]);
    }

    return diffs;
}
