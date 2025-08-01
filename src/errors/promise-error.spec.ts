/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { xJetPromiseError } from './promise.error';
import { hintComponent } from '@components/format.component';

/**
 * Mock dependencies
 */

jest.mock('@diff/diff.module', () => ({
    serialize: jest.fn()
}));

jest.mock('@components/color.component', () => ({
    RECEIVED: jest.fn((str) => `RECEIVED(${ str })`)
}));

jest.mock('@components/format.component', () => ({
    hintComponent: jest.fn()
}));

/**
 * Tests
 */

describe('xJetPromiseError', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        (hintComponent as jest.Mock).mockImplementation((chain) => `expect(received).${ chain.join('.') }`);
        (serialize as jest.Mock).mockImplementation((value) => [ JSON.stringify(value) ]);
    });

    test('should create an error with a formatted message', () => {
        const error = new xJetPromiseError({
            hintChain: [ 'property' ],
            message: 'promise resolved instead of rejected',
            value: { data: 'test' },
            valueKind: 'Resolved'
        });

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(xJetPromiseError);
        expect(error.name).toBe('Error'); // Default name from Error class

        // Verify the message contains all required parts
        expect(error.message).toContain('expect(received).property');
        expect(error.message).toContain('Matcher error: promise resolved instead of rejected');
        expect(error.message).toContain('Resolved to value:');
        expect(error.message).toContain('RECEIVED({"data":"test"})');
    });

    test('should properly format complex hint chains', () => {
        (hintComponent as jest.Mock).mockImplementation((chain) =>
            `expect(received).${ chain.join('.') }`);

        const error = new xJetPromiseError({
            hintChain: [ 'promise', 'rejects', 'toThrow' ],
            message: 'promise rejected with wrong error',
            value: new Error('Unexpected error'),
            valueKind: 'Rejected'
        });

        expect(hintComponent).toHaveBeenCalledWith([ 'promise', 'rejects', 'toThrow' ], []);
        expect(error.message).toContain('expect(received).promise.rejects.toThrow');
        expect(error.message).toContain('Rejected to value:');
    });

    test('should correctly serialize complex objects', () => {
        const complexObject = { a: 1, b: { c: 'test' }, d: [ 1, 2, 3 ] };
        (serialize as jest.Mock).mockReturnValueOnce([ '{"a":1,"b":{"c":"test"},"d":[1,2,3]}' ]);

        const error = new xJetPromiseError({
            hintChain: [ 'data' ],
            message: 'Invalid promise result',
            value: complexObject,
            valueKind: 'Resolved'
        });

        expect(serialize).toHaveBeenCalledWith(complexObject, '');
        expect(error.message).toContain('RECEIVED({"a":1,"b":{"c":"test"},"d":[1,2,3]})');
    });

    test('should handle error objects as values', () => {
        const errorObject = new Error('Test error');
        (serialize as jest.Mock).mockReturnValueOnce([ '"Error: Test error"' ]);

        const error = new xJetPromiseError({
            hintChain: [ 'toThrow' ],
            message: 'Expected error not thrown',
            value: errorObject,
            valueKind: 'Rejected'
        });

        expect(serialize).toHaveBeenCalledWith(errorObject, '');
        expect(error.message).toContain('RECEIVED("Error: Test error")');
    });

    test('should handle primitive values', () => {
        (serialize as jest.Mock).mockReturnValueOnce([ '42' ]);

        const error = new xJetPromiseError({
            hintChain: [ 'resolves', 'toBe' ],
            message: 'Expected value to be string but got number',
            value: 42,
            valueKind: 'Resolved'
        });

        expect(serialize).toHaveBeenCalledWith(42, '');
        expect(error.message).toContain('RECEIVED(42)');
    });

    test('should capture stack trace when available', () => {
        const originalCaptureStackTrace = Error.captureStackTrace;
        const mockCaptureStackTrace = jest.fn();
        Error.captureStackTrace = mockCaptureStackTrace;

        new xJetPromiseError({
            hintChain: [ 'test' ],
            message: 'Test error',
            value: null,
            valueKind: 'Resolved'
        });

        expect(mockCaptureStackTrace).toHaveBeenCalled();

        // Restore original function
        Error.captureStackTrace = originalCaptureStackTrace;
    });

    test('should handle empty hint chains', () => {
        const error = new xJetPromiseError({
            hintChain: [],
            message: 'Promise error with no context',
            value: 'unexpected value',
            valueKind: 'Resolved'
        });

        expect(hintComponent).toHaveBeenCalledWith([], []);
        expect(error.message).toContain('Matcher error: Promise error with no context');
    });
});
