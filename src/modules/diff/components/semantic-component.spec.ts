/**
 * Import will remove at compile time
 */

import type { DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';

/**
 * Imports
 */

import { cleanupSemantic } from './semantic.component';
import { DiffTypes } from '@diff/providers/string.provider';

/**
 * Tests
 */

describe('cleanupSemantic', () => {
    // Helper function to make test cases more readable
    const createDiff = (type: DiffTypes, text: string): DiffSegmentType => [ type, text ];

    describe('basic functionality', () => {
        test('should return an empty array when given an empty array', () => {
            const input: Array<DiffSegmentType> = [];
            const result = cleanupSemantic(input);
            expect(result).toEqual([]);
        });

        test('should keep large equal segments intact', () => {
            const input: Array<DiffSegmentType> = [ createDiff(DiffTypes.EQUAL, 'large equal segment') ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([ createDiff(DiffTypes.EQUAL, 'large equal segment') ]);
        });

        test('should keep delete segments intact when no merging needed', () => {
            const input: Array<DiffSegmentType> = [ createDiff(DiffTypes.DELETE, 'deleted text') ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([ createDiff(DiffTypes.DELETE, 'deleted text') ]);
        });

        test('should keep insert segments intact when no merging needed', () => {
            const input: Array<DiffSegmentType> = [ createDiff(DiffTypes.INSERT, 'inserted text') ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([ createDiff(DiffTypes.INSERT, 'inserted text') ]);
        });
    });

    describe('small equal handling', () => {
        test('should merge single character equal segments into adjacent operations', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'ab'),
                createDiff(DiffTypes.EQUAL, 'c'),
                createDiff(DiffTypes.INSERT, 'de')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'abc'),
                createDiff(DiffTypes.INSERT, 'cde')
            ]);
        });

        test('should handle empty string equals as small equals', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'ab'),
                createDiff(DiffTypes.EQUAL, ''),
                createDiff(DiffTypes.INSERT, 'cd')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'ab'),
                createDiff(DiffTypes.INSERT, 'cd')
            ]);
        });

        test('should merge single character equals between multiple operations', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'a'),
                createDiff(DiffTypes.EQUAL, 'b'),
                createDiff(DiffTypes.INSERT, 'c'),
                createDiff(DiffTypes.EQUAL, 'd'),
                createDiff(DiffTypes.DELETE, 'e')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'abde'),
                createDiff(DiffTypes.INSERT, 'bcd')
            ]);
        });
    });

    describe('mixed segment handling', () => {
        test('should correctly handle alternating large and small equal segments', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'abc'),
                createDiff(DiffTypes.EQUAL, 'x'),      // small equal
                createDiff(DiffTypes.INSERT, 'def'),
                createDiff(DiffTypes.EQUAL, 'large'),  // large equal
                createDiff(DiffTypes.DELETE, 'ghi'),
                createDiff(DiffTypes.EQUAL, 'y'),      // small equal
                createDiff(DiffTypes.INSERT, 'jkl')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'abcx'),
                createDiff(DiffTypes.INSERT, 'xdef'),
                createDiff(DiffTypes.EQUAL, 'large'),
                createDiff(DiffTypes.DELETE, 'ghiy'),
                createDiff(DiffTypes.INSERT, 'yjkl')
            ]);
        });

        test('should handle consecutive delete and insert operations with small equals between them', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'abc'),
                createDiff(DiffTypes.EQUAL, 'x'),
                createDiff(DiffTypes.DELETE, 'def'),
                createDiff(DiffTypes.EQUAL, 'y'),
                createDiff(DiffTypes.INSERT, 'ghi')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'abcxdefy'),
                createDiff(DiffTypes.INSERT, 'xyghi')
            ]);
        });

        test('should handle the real-world example from comments', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'te'),
                createDiff(DiffTypes.EQUAL, 's'),
                createDiff(DiffTypes.INSERT, 'a')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'tes'),
                createDiff(DiffTypes.INSERT, 'sa')
            ]);
        });
    });

    describe('edge cases', () => {
        test('should handle unexpected diff types by passing them through', () => {
            // Using 2 as an unexpected diff type
            const input: Array<DiffSegmentType> = [ createDiff(2 as DiffTypes, 'unexpected') ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([ createDiff(2 as DiffTypes, 'unexpected') ]);
        });

        test('should correctly handle mixed expected and unexpected diff types', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, 'abc'),
                createDiff(2 as DiffTypes, 'unexpected'),
                createDiff(DiffTypes.INSERT, 'def')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'abc'),
                createDiff(2 as DiffTypes, 'unexpected'),
                createDiff(DiffTypes.INSERT, 'def')
            ]);
        });

        test('should handle empty text in diff segments', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.DELETE, ''),
                createDiff(DiffTypes.EQUAL, ''),
                createDiff(DiffTypes.INSERT, '')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([]);
        });
    });

    describe('complex scenarios', () => {
        test('should handle a complex real-world diff example', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.EQUAL, 'test '),
                createDiff(DiffTypes.DELETE, 'vcs'),
                createDiff(DiffTypes.INSERT, 'avd'),
                createDiff(DiffTypes.EQUAL, ' end '),
                createDiff(DiffTypes.DELETE, 'ghzz'),
                createDiff(DiffTypes.INSERT, 'dzsa'),
                createDiff(DiffTypes.EQUAL, ' end')
            ];

            const result = cleanupSemantic(input);

            // We expect large equals to remain, small equals to be merged
            expect(result).toEqual([
                createDiff(DiffTypes.EQUAL, 'test '),
                createDiff(DiffTypes.DELETE, 'vcs'),
                createDiff(DiffTypes.INSERT, 'avd'),
                createDiff(DiffTypes.EQUAL, ' end '),
                createDiff(DiffTypes.DELETE, 'ghzz'),
                createDiff(DiffTypes.INSERT, 'dzsa'),
                createDiff(DiffTypes.EQUAL, ' end')
            ]);
        });
    });

    describe('specific diff cases', () => {
        test('should correctly diff "Hello world!" and "Hello planet!"', () => {
            const input: Array<DiffSegmentType> = [
                createDiff(DiffTypes.EQUAL, 'Hello '),
                createDiff(DiffTypes.DELETE, 'world'),
                createDiff(DiffTypes.INSERT, 'planet'),
                createDiff(DiffTypes.EQUAL, '!')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual([
                createDiff(DiffTypes.EQUAL, 'Hello '),
                createDiff(DiffTypes.DELETE, 'world'),
                createDiff(DiffTypes.INSERT, 'planet'),
                createDiff(DiffTypes.EQUAL, '!')
            ]);
        });

        test('should not merge equal segment longer than 1 surrounded by delete and insert', () => {
            const input = [
                createDiff(DiffTypes.DELETE, 'foo'),
                createDiff(DiffTypes.EQUAL, 'ab'),
                createDiff(DiffTypes.INSERT, 'xyz')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual(input);
        });

        test('should not merge small equal at start if not surrounded by edits', () => {
            const input = [
                createDiff(DiffTypes.EQUAL, 'a'),
                createDiff(DiffTypes.INSERT, 'b')
            ];
            const result = cleanupSemantic(input);
            expect(result).toEqual(input);
        });

        test('buffers flush properly with no remaining content', () => {
            const input = [
                createDiff(DiffTypes.DELETE, 'a'),
                createDiff(DiffTypes.EQUAL, 'b'),
                createDiff(DiffTypes.INSERT, 'c')
            ];
            const result = cleanupSemantic(input);
            // Buffers should flush correctly to produce merged segments
            expect(result).toEqual([
                createDiff(DiffTypes.DELETE, 'ab'),
                createDiff(DiffTypes.INSERT, 'bc')
            ]);
        });
    });
});
