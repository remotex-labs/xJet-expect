/**
 * Imports
 */

import type { OptionsExpectErrorInterface } from '@errors/interfaces/expect-error.interface';
import { xJetExpectError } from '@errors/expect.error';
import { composeStatement } from '@components/format.component';

/**
 * Mock dependencies
 */

jest.mock('@components/format.component', () => ({
    composeStatement: jest.fn()
}));

/**
 * Tests
 */

describe('xJetExpectError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('constructs with message from composeStatement and info lines', () => {
        (composeStatement as jest.Mock).mockReturnValue('formatted statement');

        const options: OptionsExpectErrorInterface = {
            info: [ 'additional info line 1', 'additional info line 2' ],
            assertionChain: [],
            assertion: {
                name: 'toBe',
                pass: false,
                expected: 'expected',
                received: 'received',
                message: 'original message'
            }
        };

        const error = new xJetExpectError(options);

        expect(composeStatement).toHaveBeenCalledWith(options);
        expect(error.message).toContain('formatted statement');
        expect(error.message).toContain('additional info line 1');
        expect(error.message).toContain('additional info line 2');
        expect(error.matcherResult).toBe(options.assertion);
        expect(typeof error.matcherResult!.message).toBe('string');
        expect(error.matcherResult!.message).toBe(error.message);
    });

    test('constructs without info lines', () => {
        (composeStatement as jest.Mock).mockReturnValue('formatted statement');

        const options: OptionsExpectErrorInterface = {
            assertionChain: [],
            assertion: {
                name: 'toEqual',
                pass: true,
                expected: 42,
                received: 42,
                message: 'original message'
            }
        };

        const error = new xJetExpectError(options);

        expect(error.message).toBe('formatted statement\n');
        expect(error.matcherResult).toBe(options.assertion);
        expect(error.matcherResult!.message).toBe(error.message);
    });

    test('constructs without assertion property', () => {
        (composeStatement as jest.Mock).mockReturnValue('formatted statement');

        const options: OptionsExpectErrorInterface = {
            info: [ 'info line' ],
            assertionChain: []
        };

        const error = new xJetExpectError(options);

        expect(error.message).toContain('formatted statement');
        expect(error.message).toContain('info line');
        expect(error.matcherResult).toBeUndefined();
    });
});
