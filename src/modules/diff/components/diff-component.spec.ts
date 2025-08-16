/**
 * Imports
 */

import { serialize } from '@components/serialize.component';
import { cleanupSemantic } from '@diff/components/semantic.component';
import { CYAN, DIM, EXPECTED, RECEIVED } from '@components/color.component';
import { diffLinesRaw, diffStringsRaw, DiffTypes } from '@diff/providers/string.provider';
import { diffArgs, diffComponent, diffStrings, getType, normalizeAsymmetric } from '@diff/components/diff.component';

/**
 * Mock dependencies
 */

jest.mock('@diff/providers/string.provider', () => ({
    diffLinesRaw: jest.fn(),
    diffStringsRaw: jest.fn(),
    DiffTypes: {
        EQUAL: 0,
        DELETE: -1,
        INSERT: 1
    }
}));

jest.mock('@diff/components/semantic.component', () => ({
    cleanupSemantic: jest.fn(diffs => diffs)
}));

jest.mock('@components/serialize.component', () => ({
    serialize: jest.fn().mockReturnValue([])
}));

jest.mock('@components/color.component', () => ({
    DIM: jest.fn(str => `DIM(${ str })`),
    CYAN: jest.fn(str => `CYAN(${ str })`),
    EXPECTED: jest.fn(str => `EXPECTED(${ str })`),
    INVERSE: jest.fn(str => `INVERSE(${ str })`),
    RECEIVED: jest.fn(str => `RECEIVED(${ str })`)
}));

/**
 * DummyPattern
 */

class DummyPattern {
    matches(received: unknown): boolean {
        // For testing, match if received is exactly 'match'
        return received === 'match';
    }

    get expectedLabel(): string {
        return 'dummy label';
    }
}

/**
 * Tests
 */

describe('getType', () => {
    test('should return "null" for null values', () => {
        expect(getType(null)).toBe('null');
    });

    test('should return primitive types correctly', () => {
        expect(getType(42)).toBe('number');
        expect(getType('hello')).toBe('string');
        expect(getType(true)).toBe('true');
        expect(getType(false)).toBe('false');
        expect(getType(undefined)).toBe('undefined');
    });

    test('should return constructor name for objects', () => {
        expect(getType([])).toBe('Array');
        expect(getType(new Map())).toBe('Map');
        expect(getType(new Set())).toBe('Set');
        expect(getType(new Date())).toBe('Date');
    });

    test('should return "Object" for regular objects', () => {
        expect(getType({})).toBe('Object');
    });

    test('should return "Object" for objects without constructor', () => {
        const obj = Object.create(null);
        expect(getType(obj)).toBe('Object');
    });
});

describe('diffStrings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should handle identical strings', () => {
        const a = 'line one\nline two';
        const b = 'line one\nline two';
        const result: string[] = [];

        const output = diffStrings(a, b, result);

        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,2 +1,2 @@\n');
        expect(DIM).toHaveBeenCalledTimes(2);
        expect(DIM).toHaveBeenCalledWith('  line one');
        expect(DIM).toHaveBeenCalledWith('  line two');
        expect(output).toContain('CYAN(\n@@ -1,2 +1,2 @@\n)');
    });

    test('should format differences between strings', () => {
        const a = 'line one\nline two\nline three';
        const b = 'line one\nchanged line\nline three';
        const result: string[] = [];

        // Mock the diff result for the changed line
        (diffStringsRaw as jest.Mock).mockImplementation((lineA, lineB) => {
            if (lineA === 'line two' && lineB === 'changed line') {
                return [
                    [ DiffTypes.DELETE, 'line ' ],
                    [ DiffTypes.EQUAL, '' ],
                    [ DiffTypes.INSERT, 'changed ' ],
                    [ DiffTypes.EQUAL, 'line' ]
                ];
            }

            return [[ DiffTypes.EQUAL, lineA ]];
        });

        diffStrings(a, b, result);

        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,3 +1,3 @@\n');
        expect(DIM).toHaveBeenCalledWith('  line one');
        expect(DIM).toHaveBeenCalledWith('  line three');
        expect(EXPECTED).toHaveBeenCalledWith('- INVERSE(line )line');
        expect(RECEIVED).toHaveBeenCalledWith('+ INVERSE(changed )line');
    });

    test('should apply semantic cleanup when clean=true', () => {
        const a = 'line';
        const b = 'modified';
        const result: string[] = [];

        (diffStringsRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.DELETE, 'line' ],
            [ DiffTypes.INSERT, 'modified' ]
        ]);

        diffStrings(a, b, result, true);

        expect(cleanupSemantic).toHaveBeenCalled();
    });

    test('should not apply semantic cleanup when clean=false', () => {
        const a = 'line';
        const b = 'modified';
        const result: string[] = [];

        (diffStringsRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.DELETE, 'line' ],
            [ DiffTypes.INSERT, 'modified' ]
        ]);

        diffStrings(a, b, result, false);


        expect(cleanupSemantic).not.toHaveBeenCalled();
    });

    test('should handle empty lines', () => {
        const a = 'line one\n\nline three';
        const b = 'line one\nline two\nline three';
        const result: string[] = [];

        (diffStringsRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, '' ],
            [ DiffTypes.INSERT, 'line two' ]
        ]);

        diffStrings(a, b, result);

        expect(EXPECTED).toHaveBeenCalled();
        expect(RECEIVED).toHaveBeenCalled();
    });

    test('should handle different length inputs', () => {
        const a = 'line one\nline two';
        const b = 'line one\nline two\nline three';
        const result: string[] = [];

        (diffStringsRaw as jest.Mock).mockReturnValue([[ DiffTypes.EQUAL, 'line three' ]]);

        diffStrings(a, b, result);

        // The third line should be shown as added
        expect(RECEIVED).toHaveBeenCalledWith('+ line three');
    });

    test('should return joined result array as string', () => {
        const a = 'line one';
        const b = 'line two';
        const result: string[] = [];

        (diffStringsRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.DELETE, 'line one' ],
            [ DiffTypes.INSERT, 'line two' ]
        ]);

        const output = diffStrings(a, b, result);

        // Verify the output is the joined array
        expect(output).toBe(result.join('\n'));
    });
});

describe('diffComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should display type differences when types are different', () => {
        (serialize as jest.Mock).mockReturnValue([]);
        (diffLinesRaw as jest.Mock).mockReturnValue([]);
        diffComponent(42, 'string value');

        expect(EXPECTED).toHaveBeenCalledWith('number');
        expect(RECEIVED).toHaveBeenCalledWith('string');
    });

    test('should use specialized string comparison for string values', () => {
        const a = 'string one';
        const b = 'string two';

        // We don't need to directly test diffStrings here, as it has its own tests
        // Instead, we'll verify the output of diffComponent for string values
        const result = diffComponent(a, b);

        // Verification will depend on how diffStrings processes the values
        // and we should see the result in the output
        expect(result).toContain('CYAN(');
        // Further verification can be done depending on what diffStrings produces
    });

    test('should handle non-string values by serializing them', () => {
        const a = { name: 'test', value: 123 };
        const b = { name: 'test', value: 456 };
        const serializedA = [ 'Object {', '  name: "test",', '  value: 123', '}' ];
        const serializedB = [ 'Object {', '  name: "test",', '  value: 456', '}' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Object {' ],
            [ DiffTypes.EQUAL, '  name: "test",' ],
            [ DiffTypes.DELETE, '  value: 123' ],
            [ DiffTypes.INSERT, '  value: 456' ],
            [ DiffTypes.EQUAL, '}' ]
        ]);

        diffComponent(a, b);

        expect(serialize).toHaveBeenCalledTimes(2);
        expect(serialize).toHaveBeenCalledWith(a);
        expect(serialize).toHaveBeenCalledWith(b);
        expect(diffLinesRaw).toHaveBeenCalledWith(serializedA, serializedB);
        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,4 +1,4 @@\n');
        expect(DIM).toHaveBeenCalledWith('  Object {');
        expect(DIM).toHaveBeenCalledWith('    name: "test",');
        expect(EXPECTED).toHaveBeenCalledWith('-   value: 123');
        expect(RECEIVED).toHaveBeenCalledWith('+   value: 456');
        expect(DIM).toHaveBeenCalledWith('  }');
    });

    test('should pass clean parameter to string comparison', () => {
        const a = 'string one';
        const b = 'string two';

        diffComponent(a, b);
        diffComponent(a, b, false);
        expect(cleanupSemantic).toHaveBeenCalledTimes(1);
    });

    test('should format non-string diff output with proper coloring', () => {
        const a = [ 1, 2, 3 ];
        const b = [ 1, 2, 4 ];
        const serializedA = [ 'Array [', '  1,', '  2,', '  3', ']' ];
        const serializedB = [ 'Array [', '  1,', '  2,', '  4', ']' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Array [' ],
            [ DiffTypes.EQUAL, '  1,' ],
            [ DiffTypes.EQUAL, '  2,' ],
            [ DiffTypes.DELETE, '  3' ],
            [ DiffTypes.INSERT, '  4' ],
            [ DiffTypes.EQUAL, ']' ]
        ]);

        diffComponent(a, b);

        expect(DIM).toHaveBeenCalledWith('  Array [');
        expect(DIM).toHaveBeenCalledWith('    1,');
        expect(DIM).toHaveBeenCalledWith('    2,');
        expect(EXPECTED).toHaveBeenCalledWith('-   3');
        expect(RECEIVED).toHaveBeenCalledWith('+   4');
        expect(DIM).toHaveBeenCalledWith('  ]');
    });

    test('should handle same-type but complex differences', () => {
        const a = { nested: { value: 1 } };
        const b = { nested: { value: 2 } };
        const serializedA = [ 'Object {', '  nested: Object {', '    value: 1', '  }', '}' ];
        const serializedB = [ 'Object {', '  nested: Object {', '    value: 2', '  }', '}' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Object {' ],
            [ DiffTypes.EQUAL, '  nested: Object {' ],
            [ DiffTypes.DELETE, '    value: 1' ],
            [ DiffTypes.INSERT, '    value: 2' ],
            [ DiffTypes.EQUAL, '  }' ],
            [ DiffTypes.EQUAL, '}' ]
        ]);

        diffComponent(a, b);

        // Verify type difference header is not added
        expect(EXPECTED).not.toHaveBeenCalledWith('Object');

        // Verify diff formatting is applied correctly
        expect(DIM).toHaveBeenCalledWith('  Object {');
        expect(DIM).toHaveBeenCalledWith('    nested: Object {');
        expect(EXPECTED).toHaveBeenCalledWith('-     value: 1');
        expect(RECEIVED).toHaveBeenCalledWith('+     value: 2');
    });

    test('should return correct output for empty strings', () => {
        const a = '';
        const b = '';

        const result = diffComponent(a, b);

        expect(result).toContain('CYAN(\n@@ -1,1 +1,1 @@\n)');
    });

    test('should handle null and undefined values', () => {
        diffComponent(null, undefined);

        expect(EXPECTED).toHaveBeenCalledWith('null');
        expect(RECEIVED).toHaveBeenCalledWith('undefined');
    });

    test('should handle boolean values', () => {
        const a = true;
        const b = false;
        const serializedA = [ 'true' ];
        const serializedB = [ 'false' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.DELETE, 'true' ],
            [ DiffTypes.INSERT, 'false' ]
        ]);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('- true');
        expect(RECEIVED).toHaveBeenCalledWith('+ false');
    });

    test('should handle Date objects', () => {
        const a = new Date('2023-01-01');
        const b = new Date('2023-02-01');
        const serializedA = [ 'Date "2023-01-01T00:00:00.000Z"' ];
        const serializedB = [ 'Date "2023-02-01T00:00:00.000Z"' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.DELETE, 'Date "2023-01-01T00:00:00.000Z"' ],
            [ DiffTypes.INSERT, 'Date "2023-02-01T00:00:00.000Z"' ]
        ]);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('- Date "2023-01-01T00:00:00.000Z"');
        expect(RECEIVED).toHaveBeenCalledWith('+ Date "2023-02-01T00:00:00.000Z"');
    });

    test('should correctly format multi-line string differences', () => {
        const a = 'line 1\nline 2\nline 3';
        const b = 'line 1\nmodified line\nline 3';

        // The behavior here depends on the underlying diffStrings implementation
        // which is already tested separately
        const result = diffComponent(a, b);

        expect(result).toContain('CYAN(');
        // We can't make more specific assertions without knowing the exact implementation details
    });

    test('should handle arrays with nested objects', () => {
        const a = [{ id: 1, name: 'item1' }];
        const b = [{ id: 1, name: 'modified' }];
        const serializedA = [ 'Array [', '  Object {', '    id: 1,', '    name: "item1"', '  }', ']' ];
        const serializedB = [ 'Array [', '  Object {', '    id: 1,', '    name: "modified"', '  }', ']' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Array [' ],
            [ DiffTypes.EQUAL, '  Object {' ],
            [ DiffTypes.EQUAL, '    id: 1,' ],
            [ DiffTypes.DELETE, '    name: "item1"' ],
            [ DiffTypes.INSERT, '    name: "modified"' ],
            [ DiffTypes.EQUAL, '  }' ],
            [ DiffTypes.EQUAL, ']' ]
        ]);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('-     name: "item1"');
        expect(RECEIVED).toHaveBeenCalledWith('+     name: "modified"');
    });

    test('should return correctly formatted output when adding new properties', () => {
        const a = { id: 1 };
        const b = { id: 1, name: 'new property' };
        const serializedA = [ 'Object {', '  id: 1', '}' ];
        const serializedB = [ 'Object {', '  id: 1,', '  name: "new property"', '}' ];

        (serialize as jest.Mock)
            .mockReturnValueOnce(serializedA)
            .mockReturnValueOnce(serializedB);

        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Object {' ],
            [ DiffTypes.DELETE, '  id: 1' ],
            [ DiffTypes.INSERT, '  id: 1,' ],
            [ DiffTypes.INSERT, '  name: "new property"' ],
            [ DiffTypes.EQUAL, '}' ]
        ]);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('-   id: 1');
        expect(RECEIVED).toHaveBeenCalledWith('+   id: 1,');
        expect(RECEIVED).toHaveBeenCalledWith('+   name: "new property"');
    });
});

describe('normalizeAsymmetric', () => {
    test('returns same references if a === b', () => {
        const obj = {};
        expect(normalizeAsymmetric(obj, obj)).toEqual([ obj, obj ]);
    });

    test('returns [a,b] if either is not object', () => {
        expect(normalizeAsymmetric(1, {})).toEqual([ 1, {}]);
        expect(normalizeAsymmetric({}, 2)).toEqual([{}, 2 ]);
        expect(normalizeAsymmetric(null, {})).toEqual([ null, {}]);
        expect(normalizeAsymmetric({}, undefined)).toEqual([{}, undefined ]);
    });

    test('returns [a,b] if asymmetricMatch returns undefined', () => {
        const a = {};
        const b = {};
        // Because a and b are plain objects and not asymmetric, asymmetricMatch returns undefined internally
        expect(normalizeAsymmetric(a, b)).toEqual([ a, b ]);
    });

    test('returns [b,b] if a is asymmetric and matches b', () => {
        const a = new DummyPattern();
        const b = 'match'; // `a.matches(b)` returns true

        const [ na, nb ] = normalizeAsymmetric(a, b);
        expect(na).toBe(b);
        expect(nb).toBe(b);
    });

    test('returns [a,a] if b is asymmetric and matches a', () => {
        const b = new DummyPattern();
        const a = 'match'; // `b.matches(a)` returns true

        const [ na, nb ] = normalizeAsymmetric(a, b);
        expect(na).toBe(a);
        expect(nb).toBe(a);
    });

    test('does not normalize if asymmetric match returns undefined', () => {
        const a = new DummyPattern();
        const b = 'no match'; // `a.matches(b)` returns false

        expect(normalizeAsymmetric(a, b)).toEqual([ a, b ]);
    });

    test('recurses into arrays and normalizes elements', () => {
        const a = [ new DummyPattern(), 'match', 5 ];
        const b = [ 'match', 'match', 5 ];

        const [ na, nb ] = <[ typeof a, typeof b]> normalizeAsymmetric(a, b);

        expect(na[0]).toBe(nb[0]); // Because asymmetric normalizes to matched value 'b' element
        expect(na[1]).toBe('match');
        expect(nb[1]).toBe('match');
        expect(na[2]).toBe(5);
        expect(nb[2]).toBe(5);
    });

    test('recurses into objects and normalizes properties', () => {
        const a = { x: new DummyPattern(), y: 'match', z: 5 };
        const b = { x: 'match', y: 'match', z: 5 };

        const [ na, nb ] = <[ typeof a, typeof b]>normalizeAsymmetric(a, b);

        expect(na.x).toBe(nb.x);
        expect(na.y).toBe('match');
        expect(nb.y).toBe('match');
        expect(na.z).toBe(5);
        expect(nb.z).toBe(5);
    });
});

describe('diffArgs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns DIM for equal values', () => {
        (serialize as jest.Mock).mockReturnValueOnce([ '1' ]).mockReturnValueOnce([ '1' ]);
        (diffLinesRaw as jest.Mock).mockReturnValue([[ DiffTypes.EQUAL, '1' ]]);

        const result = diffArgs([ 1 ], [ 1 ]);

        expect(result).toEqual([ 'DIM(1)' ]);
        expect(DIM).toHaveBeenCalledWith('1');
    });

    test('returns RECEIVED for inserted values', () => {
        (serialize as jest.Mock).mockReturnValueOnce([ '1' ]).mockReturnValueOnce([ '1', '2' ]);
        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, '1' ],
            [ DiffTypes.INSERT, '2' ]
        ]);

        const result = diffArgs([ 1 ], [ 1, 2 ]);

        expect(result).toEqual([ 'DIM(1)', 'RECEIVED(2)' ]);
        expect(RECEIVED).toHaveBeenCalledWith('2');
    });

    test('preserves trailing commas correctly', () => {
        (serialize as jest.Mock).mockReturnValueOnce([ 'a' ]).mockReturnValueOnce([ 'a', 'b' ]);
        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'a,' ],
            [ DiffTypes.INSERT, 'b,' ]
        ]);

        const result = diffArgs([ 'a' ], [ 'a', 'b' ]);

        expect(result).toEqual([ 'DIM(a),', 'RECEIVED(b),' ]);
        expect(DIM).toHaveBeenCalledWith('a');
        expect(RECEIVED).toHaveBeenCalledWith('b');
    });

    test('returns empty array when no diffs', () => {
        (serialize as jest.Mock).mockReturnValueOnce([]).mockReturnValueOnce([]);
        (diffLinesRaw as jest.Mock).mockReturnValue([]);

        const result = diffArgs([], []);

        expect(result).toEqual([]);
    });
});
