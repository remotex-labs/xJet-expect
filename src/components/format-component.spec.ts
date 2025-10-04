/**
 * Imports
 */

import { composeStatement } from '@components/format.component';
import { DIM, RECEIVED, EXPECTED } from '@components/color.component';

/**
 * Mock dependencies
 */

xJet.mock<any, any, any>(DIM).mockImplementation((str: string) => `DIM(${ str })`);
xJet.mock<any, any, any>(RECEIVED).mockImplementation((str: string) => `RECEIVED(${ str })`);
xJet.mock<any, any, any>(EXPECTED).mockImplementation((str: string) => `EXPECTED(${ str })`);

console.log(globalThis);

/**
 * Tests
 */

describe('composeStatement', () => {
    afterAll(() => {
        xJet.restoreAllMocks();
    });

    test('throws an error when assertionChain is empty', () => {
        expect(() => composeStatement({ assertionChain: [] })).toThrow(
            'Expected non-empty matcher chain (e.g., ["toEqual"]). Received an empty array.'
        );
    });

    test('builds statement with defaults and no expected labels or comment', () => {
        const result = composeStatement({ assertionChain: [ 'toBe' ] });
        expect(result).toBe(
            'DIM(expect()RECEIVED(received)DIM()).toBe()'
        );
    });

    test('builds statement with multiple expected labels', () => {
        const result = composeStatement({
            assertionChain: [ 'toEqual' ],
            expectedLabels: [ 'expectedValue', 'anotherValue' ]
        });
        expect(result).toBe(
            'DIM(expect()' + 'RECEIVED(received)' + DIM(')') + '.' + 'toEqual' + '(' +
            'EXPECTED(expectedValue), EXPECTED(anotherValue)' + ')'
        ); // Adjust based on your color functions
    });

    test('includes comment if provided', () => {
        const result = composeStatement({
            assertionChain: [ 'rejects', 'toThrow' ],
            comment: 'should throw error'
        });
        expect(result).toContain(' // should throw error');
    });

    test('uses custom received label', () => {
        const result = composeStatement({
            assertionChain: [ 'toBeTruthy' ],
            receivedLabeled: 'actualValue'
        });
        expect(result).toContain('RECEIVED(actualValue)');
    });
});
