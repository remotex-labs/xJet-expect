/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { RECEIVED } from '@components/color.component';
import { diffArgs } from '@diff/components/diff.component';
import { serializeList, serializeReturnList } from '@handlers/mock.handler';
import { ensureMock, serializeCallList, serializeHighlightedCalls } from '@handlers/mock.handler';

/**
 * Mock dependencies
 */

jest.mock('@diff/components/diff.component', () => ({
    ...jest.requireActual('@diff/components/diff.component'),
    diffArgs: jest.fn()
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

describe('ensureMock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('does not throw if received has xJetMock and mock', () => {
        const context = {
            received: { xJetMock: true, mock: {} },
            assertionChain: 'chain'
        } as any;

        expect(() => ensureMock.call(context)).not.toThrow();
    });

    test('throws xJetTypeError if received is missing xJetMock', () => {
        const context = {
            received: { mock: {} },
            assertionChain: 'chain'
        } as any;

        expect(() => ensureMock.call(context)).toThrow(TypeError);
        expect(RECEIVED).toHaveBeenCalledWith('Received');
    });

    test('throws xJetTypeError if received is missing mock', () => {
        const context = {
            received: { xJetMock: true },
            assertionChain: 'chain'
        } as any;

        expect(() => ensureMock.call(context)).toThrow(TypeError);
        expect(RECEIVED).toHaveBeenCalledWith('Received');
    });

    test('throws xJetTypeError if received is null or undefined', () => {
        const context = {
            received: null,
            assertionChain: 'chain'
        } as any;

        expect(() => ensureMock.call(context)).toThrow(TypeError);
        expect(RECEIVED).toHaveBeenCalledWith('Received');
    });

    test('includes expectedLabels in the error object', () => {
        const context = {
            received: {},
            assertionChain: [ 'chain' ]
        } as any;

        const labels = [ 'label1', 'label2' ];

        try {
            ensureMock.call(context, labels);
        } catch (err: any) {
            expect(err).toBeInstanceOf(xJetTypeError);
            expect(err.message).toContain('EXPECTED(label1), EXPECTED(label2)');
        }
    });
});

describe('serializeList variants', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (diffArgs as jest.Mock).mockImplementation(() => [ 'start', 'diffed', 'end' ]);
    });

    test('serializeList returns formatted string with default values', () => {
        const expected = [ 1, 2 ];
        const items = [[ 1, 3 ], [ 1, 2 ], [ 2, 2 ]];
        const result = serializeList(expected, items);

        expect(result.split('\n')).toHaveLength(items.length);
        expect(result).toContain('diffed');
    });

    test('serializeList highlights correct offset', () => {
        const expected = [ 1 ];
        const items = [[ 1 ], [ 2 ], [ 3 ]];
        const result = serializeList(expected, items, 2, '->');

        // The highlighted line should have the symbol
        expect(result.split('\n')[1]).toContain('->');
    });

    test('serializeList returns empty string for empty items', () => {
        expect(serializeList([], [])).toBe('');
    });

    test('serializeHighlightedCalls returns empty string for empty highlights', () => {
        const expected = [ 1 ];
        const calls = [[ 1 ], [ 2 ]];
        expect(serializeHighlightedCalls(expected, calls, [])).toBe('');
    });

    test('serializeHighlightedCalls formats highlighted calls', () => {
        const expected = [ 1 ];
        const calls = [[ 1 ], [ 2 ], [ 3 ]];
        const highlights = [ 1, 3 ];
        const result = serializeHighlightedCalls(expected, calls, highlights);

        expect(result.split('\n')).toHaveLength(highlights.length);
        expect(result).toContain('diffed');
    });

    test('serializeCallList delegates to serializeList with sliceArgs=true', () => {
        const expected = [ 1 ];
        const returns = [[ 1, 2 ], [ 3, 4 ]];
        const result = serializeCallList(expected, returns, 1, '->');

        expect(result).toContain('diffed');
    });

    test('serializeReturnList delegates to serializeList with sliceArgs=false', () => {
        const expected = [ 1, 2 ];
        const calls = [[ 1, 2 ], [ 3, 4 ]];
        const result = serializeReturnList(expected, calls, 1, '->');

        expect(result).toContain('diffed');
    });
});
