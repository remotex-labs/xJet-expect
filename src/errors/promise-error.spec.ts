/**
 * Import will remove at compile time
 */

import type { OptionsPromiseErrorInterface } from '@errors/interfaces/promise-error.interface';

/**
 * Imports
 */

import { RECEIVED } from '@components/color.component';
import { xJetPromiseError } from '@errors/promise.error';
import { serialize } from '@components/serialize.component';
import { composeStatement } from '@components/format.component';

/**
 * Mock dependencies
 */

jest.mock('@components/format.component', () => ({
    composeStatement: jest.fn()
}));

jest.mock('@components/color.component', () => ({
    RECEIVED: jest.fn()
}));

jest.mock('@components/serialize.component', () => ({
    serialize: jest.fn()
}));

/**
 * Tests
 */

describe('xJetPromiseError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('constructs with full formatted message', () => {
        (composeStatement as jest.Mock).mockReturnValue('formatted statement');
        (serialize as jest.Mock).mockReturnValue([ 'serialized', 'value' ]);
        (RECEIVED as jest.Mock).mockImplementation((str) => `<colored:${ str }>`);

        const options: OptionsPromiseErrorInterface = {
            assertionChain: [ 'rejects', 'toThrow' ],
            message: 'received promise resolved instead of rejected',
            received: { foo: 'bar' },
            promiseKind: 'Resolved'
        };

        const error = new xJetPromiseError(options);

        expect(composeStatement).toHaveBeenCalledWith(options);
        expect(serialize).toHaveBeenCalledWith(options.received, '');
        expect(RECEIVED).toHaveBeenCalledWith('serialized value');

        expect(error.message).toContain('formatted statement');
        expect(error.message).toContain('Matcher error: received promise resolved instead of rejected');
        expect(error.message).toContain('Resolved to value: <colored:serialized value>');
    });

    test('handles Rejected promise kind', () => {
        (composeStatement as jest.Mock).mockReturnValue('stmt');
        (serialize as jest.Mock).mockReturnValue([ 'x' ]);
        (RECEIVED as jest.Mock).mockReturnValue('<c:x>');

        const options: OptionsPromiseErrorInterface = {
            assertionChain: [ 'resolves', 'toBe' ],
            message: 'received promise rejected instead of resolved',
            received: 123,
            promiseKind: 'Rejected'
        };

        const error = new xJetPromiseError(options);

        expect(error.message).toContain('stmt');
        expect(error.message).toContain('Matcher error: received promise rejected instead of resolved');
        expect(error.message).toContain('Rejected to value: <c:x>');
    });
});
