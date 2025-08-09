/**
 * Import will remove at compile time
 */

import type { OptionsTypeErrorInterface } from '@errors/interfaces/type-error.interface';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { serialize } from '@components/serialize.component';
import { composeStatement } from '@components/format.component';
import { EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Mock dependencies
 */

jest.mock('@components/format.component', () => ({
    composeStatement: jest.fn()
}));

jest.mock('@components/color.component', () => ({
    EXPECTED: jest.fn(),
    RECEIVED: jest.fn()
}));

jest.mock('@components/serialize.component', () => ({
    serialize: jest.fn()
}));

/**
 * Tests
 */

describe('xJetTypeError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('constructs message with both expected and received type/value', () => {
        (composeStatement as jest.Mock).mockReturnValue('formatted statement');
        (serialize as jest.Mock)
            .mockReturnValueOnce([ 'expected serialized' ])
            .mockReturnValueOnce([ 'received serialized' ]);
        (EXPECTED as jest.Mock).mockImplementation((str) => `<E:${ str }>`);
        (RECEIVED as jest.Mock).mockImplementation((str) => `<R:${ str }>`);

        const options: OptionsTypeErrorInterface = {
            assertionChain: [ 'toBeType' ],
            message: 'type mismatch',
            expected: { type: 'string', value: 'foo' },
            received: { type: 'number', value: 42 }
        };

        const error = new xJetTypeError(options);

        expect(composeStatement).toHaveBeenCalledWith(options);

        // Expected calls
        expect(serialize).toHaveBeenNthCalledWith(1, options.expected!.value);
        expect(EXPECTED).toHaveBeenCalledWith('expected serialized');

        // Received calls
        expect(serialize).toHaveBeenNthCalledWith(2, options.received!.value);
        expect(RECEIVED).toHaveBeenCalledWith('received serialized');

        // Message assertions
        expect(error.message).toContain('formatted statement');
        expect(error.message).toContain('Matcher error: type mismatch');
        expect(error.message).toContain('Expected has type:  string');
        expect(error.message).toContain('Expected has value: <E:expected serialized>');
        expect(error.message).toContain('Received has type:  number');
        expect(error.message).toContain('Received has value: <R:received serialized>');
    });

    test('constructs message with only expected', () => {
        (composeStatement as jest.Mock).mockReturnValue('stmt');
        (serialize as jest.Mock).mockReturnValue([ 'expected only' ]);
        (EXPECTED as jest.Mock).mockReturnValue('<E:expected only>');

        const options: OptionsTypeErrorInterface = {
            assertionChain: [ 'toBeType' ],
            message: 'expected only case',
            expected: { value: true }
        };

        const error = new xJetTypeError(options);

        expect(error.message).toContain('stmt');
        expect(error.message).toContain('Matcher error: expected only case');
        expect(error.message).toContain('Expected has value: <E:expected only>');
        expect(error.message).not.toContain('Received has');
    });

    test('constructs message with only received', () => {
        (composeStatement as jest.Mock).mockReturnValue('stmt');
        (serialize as jest.Mock).mockReturnValue([ 'received only' ]);
        (RECEIVED as jest.Mock).mockReturnValue('<R:received only>');

        const options: OptionsTypeErrorInterface = {
            assertionChain: [ 'toBeType' ],
            message: 'received only case',
            received: { value: null }
        };

        const error = new xJetTypeError(options);

        expect(error.message).toContain('stmt');
        expect(error.message).toContain('Matcher error: received only case');
        expect(error.message).toContain('Received has value: <R:received only>');
        expect(error.message).not.toContain('Expected has');
    });
});
