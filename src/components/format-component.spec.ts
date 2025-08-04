/**
 * Imports
 */

import { hintComponent } from './format.component';
import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

/**
 * Mock dependencies
 */

jest.mock('@components/color.component', () => ({
    DIM: jest.fn((text) => `DIM(${ text })`),
    EXPECTED: jest.fn((text) => `EXPECTED(${ text })`),
    RECEIVED: jest.fn((text) => `RECEIVED(${ text })`)
}));

/**
 * Tests
 */

describe('hintComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should generate a simple matcher hint', () => {
        const result = hintComponent([ 'toBe' ]);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toBe(EXPECTED(expected))');
        expect(DIM).toHaveBeenCalledWith('expect(');
        expect(RECEIVED).toHaveBeenCalledWith('received');
        expect(DIM).toHaveBeenCalledWith(')');
        expect(EXPECTED).toHaveBeenCalledWith('expected');
    });

    test('should generate a chained matcher hint', () => {
        const result = hintComponent([ 'not', 'toEqual' ]);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).not.toEqual(EXPECTED(expected))');
    });

    test('should include comment when provided', () => {
        const result = hintComponent([ 'toBe' ], [], 'values should match');

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toBe()DIM( // values should match)');
        expect(DIM).toHaveBeenCalledWith(' // values should match');
    });

    test('should handle custom parameter names', () => {
        const result = hintComponent([ 'toBeGreaterThan' ], [ 'threshold' ]);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toBeGreaterThan(EXPECTED(threshold))');
    });

    test('should handle multiple parameters', () => {
        const result = hintComponent([ 'toBeWithin' ], [ 'min', 'max' ]);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toBeWithin(EXPECTED(min), EXPECTED(max))');
    });

    test('should handle empty parameters array', () => {
        const result = hintComponent([ 'toBeTruthy' ], []);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toBeTruthy()');
    });

    test('should apply special formatting to expected parameter', () => {
        const result = hintComponent([ 'toEqual' ], [ 'expected', 'options' ]);

        expect(result).toBe('DIM(expect()RECEIVED(received)DIM()).toEqual(EXPECTED(expected), EXPECTED(options))');
        expect(EXPECTED).toHaveBeenCalledWith('expected');
    });

    test('should throw error for empty matcher chain', () => {
        expect(() => hintComponent([])).toThrow(
            'Expected non-empty matcher chain (e.g., ["toEqual"]). Received an empty array.'
        );
    });
});
