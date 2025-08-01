/**
 * Imports
 */

import { serialize } from '@diff/components/serialize.component';
import { CYAN, DIM, EXPECTED, MARK, RECEIVED } from '@components/color.component';
import { diffComponent, diffStrings, getType } from '@diff/components/diff.component';
import { diffLinesRaw, diffStringsRaw, DiffTypes } from '@diff/providers/string.provider';

/**
 * Mock dependencies
 */

jest.mock('@components/color.component', () => ({
    CYAN: jest.fn((str) => `CYAN(${ str })`),
    DIM: jest.fn((str) => `DIM(${ str })`),
    EXPECTED: jest.fn((str) => `EXPECTED(${ str })`),
    INVERSE: jest.fn((str) => `INVERSE(${ str })`),
    MARK: jest.fn((str) => `MARK(${ str })`),
    RECEIVED: jest.fn((str) => `RECEIVED(${ str })`)
}));

jest.mock('@diff/providers/string.provider', () => ({
    diffLinesRaw: jest.fn(),
    diffStringsRaw: jest.fn(),
    DiffTypes: {
        EQUAL: 0,
        DELETE: -1,
        INSERT: 1
    }
}));

jest.mock('@diff/components/serialize.component', () => ({
    serialize: jest.fn()
}));

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
        const result: string[] = [];
        const a = 'same line\nanother same line';
        const b = 'same line\nanother same line';

        // Mock the implementation
        (diffStringsRaw as jest.Mock).mockReturnValue([]);

        diffStrings(a, b, result);

        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,2 +1,2 @@\n');
        expect(DIM).toHaveBeenCalledWith('  same line');
        expect(DIM).toHaveBeenCalledWith('  another same line');
        expect(result.length).toBe(3); // Header + 2 identical lines
    });

    test('should handle different strings', () => {
        const result: string[] = [];
        const a = 'line one\nline two';
        const b = 'line one\nmodified line';

        // Mock diffStringsRaw to return differences
        (diffStringsRaw as jest.Mock).mockReturnValue([[ DiffTypes.EQUAL, '' ]]);

        // First call is for identical lines, second for different lines
        (diffStringsRaw as jest.Mock)
            .mockReturnValueOnce([]) // For identical lines
            .mockReturnValueOnce([
                [ DiffTypes.DELETE, 'line two' ],
                [ DiffTypes.INSERT, 'modified line' ]
            ]);

        diffStrings(a, b, result);

        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,2 +1,2 @@\n');
        expect(DIM).toHaveBeenCalledWith('  line one');
    });

    test('should handle different length strings', () => {
        const result: string[] = [];
        const a = 'line one\nline two';
        const b = 'line one';

        (diffStringsRaw as jest.Mock).mockReturnValue([]);

        diffStrings(a, b, result);

        expect(CYAN).toHaveBeenCalledWith('\n@@ -1,2 +1,1 @@\n');
        expect(DIM).toHaveBeenCalledWith('  line one');
    });
});

describe('diffComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should handle string comparisons', () => {
        const a = 'test string';
        const b = 'test modified';

        // Mock implementations
        (EXPECTED as jest.Mock).mockImplementation(str => str);
        (RECEIVED as jest.Mock).mockImplementation(str => str);
        (MARK as jest.Mock).mockImplementation(str => str);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('Expected: ');
        expect(RECEIVED).toHaveBeenCalledWith('Recevied: ');
        expect(MARK).toHaveBeenCalledWith('string');
        expect(MARK).toHaveBeenCalledWith('string');
    });

    test('should handle non-string comparisons', () => {
        const a = { name: 'test', value: 123 };
        const b = { name: 'test', value: 456 };

        // Mock serialize to return serialized lines
        (serialize as jest.Mock)
            .mockReturnValueOnce([ 'Object {', '  name: "test",', '  value: 123', '}' ])
            .mockReturnValueOnce([ 'Object {', '  name: "test",', '  value: 456', '}' ]);

        // Mock diffLinesRaw to return differences
        (diffLinesRaw as jest.Mock).mockReturnValue([
            [ DiffTypes.EQUAL, 'Object {' ],
            [ DiffTypes.EQUAL, '  name: "test",' ],
            [ DiffTypes.DELETE, '  value: 123' ],
            [ DiffTypes.INSERT, '  value: 456' ],
            [ DiffTypes.EQUAL, '}' ]
        ]);

        diffComponent(a, b);

        expect(EXPECTED).toHaveBeenCalledWith('Expected: ');
        expect(RECEIVED).toHaveBeenCalledWith('Recevied: ');
        expect(MARK).toHaveBeenCalledWith('Object');
        expect(CYAN).toHaveBeenCalled();
        expect(DIM).toHaveBeenCalledTimes(3); // 3 unchanged lines
    });

    test('should correctly identify types of values', () => {
        const a = [ 1, 2, 3 ];
        const b = new Map();

        // Minimal mock implementation
        (serialize as jest.Mock).mockReturnValue([]);
        (diffLinesRaw as jest.Mock).mockReturnValue([]);

        diffComponent(a, b);

        expect(MARK).toHaveBeenCalledWith('Array');
        expect(MARK).toHaveBeenCalledWith('Map');
    });
});
