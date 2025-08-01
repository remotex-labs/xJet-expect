/**
 * Imports
 */

import { diffStringsRaw, DiffTypes, diffLinesRaw } from './string.provider';

/**
 * Tests
 */

describe('diffStringsRaw', () => {
    test('should return empty array for identical empty strings', () => {
        const result = diffStringsRaw('', '');
        expect(result).toEqual([]);
    });

    test('should identify identical strings as equal', () => {
        const result = diffStringsRaw('abc', 'abc');
        expect(result).toEqual([[ DiffTypes.EQUAL, 'abc' ]]);
    });

    test('should handle insertion at the beginning', () => {
        expect(diffStringsRaw('abc', 'axc')).toEqual([[ 0, 'a' ], [ -1, 'b' ], [ 1, 'x' ], [ 0, 'c' ]]);
        expect(diffStringsRaw('abc', 'xabc')).toEqual([
            [ DiffTypes.INSERT, 'x' ],
            [ DiffTypes.EQUAL, 'abc' ]
        ]);
    });

    test('should handle insertion at the end', () => {
        const result = diffStringsRaw('abc', 'abcx');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.INSERT, 'x' ]
        ]);
    });

    test('should handle insertion in the middle', () => {
        expect(diffStringsRaw('ab', 'cab')).toEqual([[ 1, 'c' ], [ 0, 'ab' ]]);
        expect(diffStringsRaw('abc', 'abxc')).toEqual([
            [ DiffTypes.EQUAL, 'ab' ],
            [ DiffTypes.INSERT, 'x' ],
            [ DiffTypes.EQUAL, 'c' ]
        ]);
    });

    test('should handle deletion at the beginning', () => {
        const result = diffStringsRaw('xabc', 'abc');
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'x' ],
            [ DiffTypes.EQUAL, 'abc' ]
        ]);
    });

    test('should handle deletion at the end', () => {
        const result = diffStringsRaw('abcx', 'abc');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.DELETE, 'x' ]
        ]);
    });

    test('should handle deletion in the middle', () => {
        const result = diffStringsRaw('abxc', 'abc');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'ab' ],
            [ DiffTypes.DELETE, 'x' ],
            [ DiffTypes.EQUAL, 'c' ]
        ]);
    });

    test('should handle mixed insertions and deletions', () => {
        const result = diffStringsRaw('abcdef', 'abxyef');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'ab' ],
            [ DiffTypes.DELETE, 'cd' ],
            [ DiffTypes.INSERT, 'xy' ],
            [ DiffTypes.EQUAL, 'ef' ]
        ]);
    });

    test('should handle completely different strings', () => {
        const result = diffStringsRaw('abc', 'xyz');
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'abc' ],
            [ DiffTypes.INSERT, 'xyz' ]
        ]);
    });

    test('should correctly identify common prefix and suffix', () => {
        const result = diffStringsRaw('abcxyzdef', 'abc123def');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.DELETE, 'xyz' ],
            [ DiffTypes.INSERT, '123' ],
            [ DiffTypes.EQUAL, 'def' ]
        ]);
    });

    test('should merge adjacent diffs of the same type', () => {
        // This test verifies the foundSubsequence behavior in the context
        const result = diffStringsRaw('abcdef', 'abcxyz');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.DELETE, 'def' ],
            [ DiffTypes.INSERT, 'xyz' ]
        ]);
        // Not [EQUAL, 'abc'], [DELETE, 'd'], [DELETE, 'e'], [DELETE, 'f'], [INSERT, 'xyz']
    });

    test('should handle single character differences', () => {
        const result = diffStringsRaw('a', 'b');
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'a' ],
            [ DiffTypes.INSERT, 'b' ]
        ]);
    });

    test('should handle empty string vs non-empty string', () => {
        const result1 = diffStringsRaw('', 'abc');
        expect(result1).toEqual([[ DiffTypes.INSERT, 'abc' ]]);
        expect(diffStringsRaw('', 'a')).toEqual([[ 1, 'a' ]]);

        const result2 = diffStringsRaw('abc', '');
        expect(result2).toEqual([[ DiffTypes.DELETE, 'abc' ]]);
        expect(diffStringsRaw('a', '')).toEqual([[ -1, 'a' ]]);
    });

    test('should detect trailing whitespace differences', () => {
        const result = diffStringsRaw('abc', 'abc ');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.INSERT, ' ' ]
        ]);
    });

    test('should handle large input efficiently', () => {
        const base = 'a'.repeat(1000) + 'X' + 'a'.repeat(1000);
        const modified = 'a'.repeat(1000) + 'Y' + 'a'.repeat(1000);
        const result = diffStringsRaw(base, modified);
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'a'.repeat(1000) ],
            [ DiffTypes.DELETE, 'X' ],
            [ DiffTypes.INSERT, 'Y' ],
            [ DiffTypes.EQUAL, 'a'.repeat(1000) ]
        ]);
    });

    test('should not merge character-by-character changes if config disables merging', () => {
        // Assuming future support for granular diff control
        expect(diffStringsRaw('abc', 'axyc')).toEqual([
            [ DiffTypes.EQUAL, 'a' ],
            [ DiffTypes.DELETE, 'b' ],
            [ DiffTypes.INSERT, 'xy' ],
            [ DiffTypes.EQUAL, 'c' ]
        ]);
    });

    test('should handle unicode and emoji differences', () => {
        const result = diffStringsRaw('hello 😊', 'hello 😢');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'hello \ud83d' ],
            [ DiffTypes.DELETE, '\ude0a' ],
            [ DiffTypes.INSERT, '\ude22' ]
        ]);
    });

    test('should handle deletion of characters in the middle', () => {
        const result = diffStringsRaw('abc123XYZ', 'abcXYZ');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.DELETE, '123' ],
            [ DiffTypes.EQUAL, 'XYZ' ]
        ]);
    });

    test('should handle insertion of characters in the middle', () => {
        const result = diffStringsRaw('abcXYZ', 'abc123XYZ');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'abc' ],
            [ DiffTypes.INSERT, '123' ],
            [ DiffTypes.EQUAL, 'XYZ' ]
        ]);
    });

    test('should handle word changes that have similar prefix characters', () => {
        const result = diffStringsRaw('text is start same', 'test is end same');
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'te' ],
            [ DiffTypes.DELETE, 'x' ],
            [ DiffTypes.INSERT, 's' ],
            [ DiffTypes.EQUAL, 't is ' ],
            [ DiffTypes.DELETE, 'start' ],
            [ DiffTypes.INSERT, 'end' ],
            [ DiffTypes.EQUAL, ' same' ]
        ]);
    });

    test('removes leading and trailing single quotes from the string', () => {
        const result = diffStringsRaw('\'acnd\'', 'acnd');
        expect(result).toEqual([
            [ DiffTypes.DELETE, '\'' ],
            [ DiffTypes.EQUAL, 'acnd' ],
            [ DiffTypes.DELETE, '\'' ]
        ]);
    });

    test('removes surrounding single quotes from left string to match right string', () => {
        const result = diffStringsRaw('\'a\'', 'a');
        expect(result).toEqual([
            [ DiffTypes.DELETE, '\'' ],
            [ DiffTypes.EQUAL, 'a' ],
            [ DiffTypes.DELETE, '\'' ]
        ]);
    });

    test('should correctly diff minimal changes in a large doc comment', () => {
        const original =
            '/**\n' +
            ' * Class representing one diff tuple.\n' +
            ' * Attempts to look like a two-element array (which is what this used to be).\n' +
            ' * @param {number} op Operation, one of: DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL.\n' +
            ' * @param {string} text Text to be deleted, inserted, or retained.\n' +
            ' * @constructor\n' +
            ' */';

        const changed =
            '/**\n' +
            ' * Class representing one diff tuple.\n' +
            ' * Attempts to look like a two-element array (which is what this used to be).\n' +
            ' * @param {number} op Operation, one of: sIFF_DELETE, DIFF_INSERT , DIFF_EQUAL.\n' +
            ' * @param {string} text Text do be deleted, inserted, or retained.\n' +
            ' * @constructor\n' +
            ' */';

        const result = diffStringsRaw(original, changed);

        expect(result).toEqual([
            [
                DiffTypes.EQUAL,
                '/**\n' +
                ' * Class representing one diff tuple.\n' +
                ' * Attempts to look like a two-element array (which is what this used to be).\n' +
                ' * @param {number} op Operation, one of: '
            ],
            [ DiffTypes.DELETE, 'D' ],
            [ DiffTypes.INSERT, 's' ],
            [ DiffTypes.EQUAL, 'IFF_DELETE, DIFF_INSERT' ],
            [ DiffTypes.INSERT, ' ' ],
            [ DiffTypes.EQUAL, ', DIFF_EQUAL.\n * @param {string} text Text ' ],
            [ DiffTypes.DELETE, 't' ],
            [ DiffTypes.INSERT, 'd' ],
            [ DiffTypes.EQUAL, 'o be deleted, inserted, or retained.\n * @constructor\n */' ]
        ]);
    });
});

describe('diffLinesRaw', () => {
    test('should return empty array when comparing empty arrays', () => {
        const result = diffLinesRaw([], []);
        expect(result).toEqual([]);
    });

    test('should detect all lines as inserted when first array is empty', () => {
        const result = diffLinesRaw([], [ 'line 1', 'line 2' ]);
        expect(result).toEqual([
            [ DiffTypes.INSERT, 'line 1' ],
            [ DiffTypes.INSERT, 'line 2' ]
        ]);
    });

    test('should detect all lines as deleted when second array is empty', () => {
        const result = diffLinesRaw([ 'line 1', 'line 2' ], []);
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'line 1' ],
            [ DiffTypes.DELETE, 'line 2' ]
        ]);
    });

    test('should detect equal lines when arrays are identical', () => {
        const lines = [ 'line 1', 'line 2', 'line 3' ];
        const result = diffLinesRaw(lines, lines);
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'line 1' ],
            [ DiffTypes.EQUAL, 'line 2' ],
            [ DiffTypes.EQUAL, 'line 3' ]
        ]);
    });

    test('should detect inserted, deleted and equal lines correctly', () => {
        const a = [ 'line 1', 'line 2', 'line 3', 'line 4' ];
        const b = [ 'line 1', 'new line', 'line 3', 'line 5' ];
        const result = diffLinesRaw(a, b);
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'line 1' ],
            [ DiffTypes.DELETE, 'line 2' ],
            [ DiffTypes.INSERT, 'new line' ],
            [ DiffTypes.EQUAL, 'line 3' ],
            [ DiffTypes.DELETE, 'line 4' ],
            [ DiffTypes.INSERT, 'line 5' ]
        ]);
    });

    test('should handle modifications at the beginning', () => {
        const result = diffLinesRaw(
            [ 'old first line', 'line 2', 'line 3' ],
            [ 'new first line', 'line 2', 'line 3' ]
        );
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'old first line' ],
            [ DiffTypes.INSERT, 'new first line' ],
            [ DiffTypes.EQUAL, 'line 2' ],
            [ DiffTypes.EQUAL, 'line 3' ]
        ]);
    });

    test('should handle modifications at the end', () => {
        const result = diffLinesRaw(
            [ 'line 1', 'line 2', 'old last line' ],
            [ 'line 1', 'line 2', 'new last line' ]
        );
        expect(result).toEqual([
            [ DiffTypes.EQUAL, 'line 1' ],
            [ DiffTypes.EQUAL, 'line 2' ],
            [ DiffTypes.DELETE, 'old last line' ],
            [ DiffTypes.INSERT, 'new last line' ]
        ]);
    });

    test('should handle completely different arrays', () => {
        const result = diffLinesRaw(
            [ 'a', 'b', 'c' ],
            [ 'x', 'y', 'z' ]
        );
        expect(result).toEqual([
            [ DiffTypes.DELETE, 'a' ],
            [ DiffTypes.DELETE, 'b' ],
            [ DiffTypes.DELETE, 'c' ],
            [ DiffTypes.INSERT, 'x' ],
            [ DiffTypes.INSERT, 'y' ],
            [ DiffTypes.INSERT, 'z' ]
        ]);
    });
});
