/**
 * Import will remove at compile time
 */

import type { DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';

/**
 * Imports
 */

import { DiffTypes } from '@diff/providers/string.provider';

/**
 * Improves the semantic meaning of a diff result by merging short equal segments into delete/insert
 * operations, making the diff more human-readable.
 *
 * @param diffs - Array of diff segments to process
 *
 * @returns A new array of diff segments with improved semantic meaning
 *
 * @remarks
 * This function handles cases where very short equal segments (1 character or less) are better
 * represented as part of delete/insert operations for improved readability. It maintains longer
 * equal segments (more than 1 character) as separate segments.
 *
 * The algorithm works by:
 * 1. Collecting delete and insert operations in buffers
 * 2. When encountering small equal segments (1 char or less), adding them to both buffers
 * 3. When encountering larger equal segments, flushing the buffers as separate operations
 *
 * @example
 * ```ts
 * const diffs = [
 *   [DiffTypes.DELETE, 'te'],
 *   [DiffTypes.EQUAL, 's'],
 *   [DiffTypes.INSERT, 'a']
 * ];
 * const result = cleanupSemantic(diffs);
 * // Result: [[DiffTypes.DELETE, 'tes'], [DiffTypes.INSERT, 'as']]
 * ```
 *
 * @since 1.0.0
 */

export function cleanupSemantic(diffs: Array<DiffSegmentType>): Array<DiffSegmentType> {
    let delBuf: string[] = [];
    let insBuf: string[] = [];
    const result: Array<DiffSegmentType> = [];

    const flushBuffers = (): void => {
        if (delBuf.length) {
            result.push([ DiffTypes.DELETE, delBuf.join('') ]);
            delBuf = [];
        }
        if (insBuf.length) {
            result.push([ DiffTypes.INSERT, insBuf.join('') ]);
            insBuf = [];
        }
    };

    for (let i = 0; i < diffs.length; i++) {
        const [ type, text ] = diffs[i];

        if (type === DiffTypes.EQUAL) {
            if (text.length <= 1) {
                const prevType = i > 0 ? diffs[i - 1][0] : null;
                const nextType = i + 1 < diffs.length ? diffs[i + 1][0] : null;
                const isEdit = (t: DiffTypes | null): boolean =>
                    t === DiffTypes.DELETE || t === DiffTypes.INSERT;

                // Merge if surrounded by any edits (delete or insert)
                const surroundedByEdit = isEdit(prevType) && isEdit(nextType);

                if (surroundedByEdit) {
                    for (const ch of text) {
                        delBuf.push(ch);
                        insBuf.push(ch);
                    }
                    continue;
                }
            }

            // Otherwise flush and keep equal
            flushBuffers();
            result.push([ DiffTypes.EQUAL, text ]);
        } else if (type === DiffTypes.DELETE) {
            for (const ch of text) delBuf.push(ch);
        } else if (type === DiffTypes.INSERT) {
            for (const ch of text) insBuf.push(ch);
        } else {
            flushBuffers();
            result.push([ type, text ]);
        }
    }

    flushBuffers();

    return result;
}
