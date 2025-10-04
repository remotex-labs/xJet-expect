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
 * Tests
 */

describe('xJetPromiseError', () => {
    beforeEach(() => {
        xJet.clearAllMocks();
    });

    test('constructs with full formatted message', () => {
        xJet.mock(serialize).mockReturnValue([ 'serialized', 'value' ]);
        xJet.mock(composeStatement).mockReturnValue('formatted statement');
        xJet.mock(RECEIVED).mockImplementation((str) => `<colored:${ str }>`);

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
        xJet.mock(serialize).mockReturnValue([ 'x' ]);
        xJet.mock(composeStatement).mockReturnValue('stmt');
        xJet.mock(RECEIVED).mockReturnValue('<c:x>');

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
