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
 * Tests
 */

describe('xJetTypeError', () => {
    beforeEach(() => {
        xJet.clearAllMocks();
    });

    test('constructs message with both expected and received type/value', () => {
        xJet.mock(composeStatement).mockReturnValue('formatted statement');
        xJet.mock(serialize)
            .mockReturnValueOnce([ 'expected serialized' ])
            .mockReturnValueOnce([ 'received serialized' ]);

        xJet.mock(EXPECTED).mockImplementation((str) => `<E:${ str }>`);
        xJet.mock(RECEIVED).mockImplementation((str) => `<R:${ str }>`);

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
        xJet.mock(composeStatement).mockReturnValue('stmt');
        xJet.mock(serialize).mockReturnValue([ 'expected only' ]);
        xJet.mock(EXPECTED).mockReturnValue('<E:expected only>');

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
        xJet.mock(composeStatement).mockReturnValue('stmt');
        xJet.mock(serialize).mockReturnValue([ 'received only' ]);
        xJet.mock(RECEIVED).mockReturnValue('<R:received only>');

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
