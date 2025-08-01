/**
 * Imports
 */

import { serialize } from '@diff/diff.module';
import { xJetTypeError } from '@errors/type.error';
import { hintComponent } from '@components/format.component';

/**
 * Mock dependencies
 */

jest.mock('@diff/diff.module', () => ({
    serialize: jest.fn()
}));

jest.mock('@components/format.component', () => ({
    hintComponent: jest.fn()
}));

jest.mock('@components/color.component', () => ({
    EXPECTED: jest.fn((str) => `EXPECTED(${ str })`),
    RECEIVED: jest.fn((str) => `RECEIVED(${ str })`)
}));

/**
 * Tests
 */

describe('xJetTypeError', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        (hintComponent as jest.Mock).mockImplementation((chain) => `expect(received).${ chain.join('.') }`);
        (serialize as jest.Mock).mockImplementation((value) => [ JSON.stringify(value) ]);
    });

    test('should create an error with a formatted message', () => {
        const error = new xJetTypeError({
            hintChain: [ 'property' ],
            message: 'Value is invalid',
            expected: { type: 'string', value: 'hello' },
            received: { type: 'number', value: 123 }
        });

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(xJetTypeError);
        expect(error.name).toBe('Error'); // Default name from Error class

        // Verify the message contains all required parts
        expect(error.message).toContain('expect(received).property');
        expect(error.message).toContain('Matcher error: Value is invalid');
        expect(error.message).toContain('Expected has type:  string');
        expect(error.message).toContain('Received has type:  number');
        expect(error.message).toContain('EXPECTED("hello")');
        expect(error.message).toContain('RECEIVED(123)');
    });

    test('should create an error with a message without expected/received when not provided', () => {
        const error = new xJetTypeError({
            hintChain: [ 'property' ],
            message: 'Something went wrong'
        });

        expect(error.message).toContain('expect(received).property');
        expect(error.message).toContain('Matcher error: Something went wrong');
        expect(error.message).not.toContain('Expected has type');
        expect(error.message).not.toContain('Received has type');
    });

    test('should create an error with only expected info when only expected is provided', () => {
        const error = new xJetTypeError({
            hintChain: [ 'property' ],
            message: 'Value is missing',
            expected: { type: 'boolean', value: true }
        });

        expect(error.message).toContain('expect(received).property');
        expect(error.message).toContain('Matcher error: Value is missing');
        expect(error.message).toContain('Expected has type:  boolean');
        expect(error.message).toContain('EXPECTED(true)');
        expect(error.message).not.toContain('Received has type');
    });

    test('should create an error with only received info when only received is provided', () => {
        const error = new xJetTypeError({
            hintChain: [ 'property' ],
            message: 'Unexpected value',
            received: { type: 'object', value: { key: 'value' } }
        });

        expect(error.message).toContain('expect(received).property');
        expect(error.message).toContain('Matcher error: Unexpected value');
        expect(error.message).not.toContain('Expected has type');
        expect(error.message).toContain('Received has type:  object');
        expect(error.message).toContain('RECEIVED({"key":"value"})');
    });

    test('should properly format complex hint chains', () => {
        (hintComponent as jest.Mock).mockImplementation((chain) =>
            `expect(received).${ chain.join('.') }`);

        const error = new xJetTypeError({
            hintChain: [ 'user', 'profile', 'age' ],
            message: 'Invalid age value',
            expected: { type: 'number', value: 25 },
            received: { type: 'string', value: '25abc' }
        });

        expect(hintComponent).toHaveBeenCalledWith([ 'user', 'profile', 'age' ], []);
        expect(error.message).toContain('expect(received).user.profile.age');
    });

    test('should correctly serialize complex objects', () => {
        const complexObject = { a: 1, b: { c: 'test' } };
        (serialize as jest.Mock).mockReturnValueOnce([ '{"a":1,"b":{"c":"test"}}' ]);

        const error = new xJetTypeError({
            hintChain: [ 'data' ],
            message: 'Invalid data',
            received: { type: 'object', value: complexObject }
        });

        expect(serialize).toHaveBeenCalledWith(complexObject, '');
        expect(error.message).toContain('RECEIVED({"a":1,"b":{"c":"test"}})');
    });

    test('should capture stack trace when available', () => {
        const originalCaptureStackTrace = Error.captureStackTrace;
        const mockCaptureStackTrace = jest.fn();
        Error.captureStackTrace = mockCaptureStackTrace;

        new xJetTypeError({
            hintChain: [ 'test' ],
            message: 'Test error'
        });

        expect(mockCaptureStackTrace).toHaveBeenCalled();

        // Restore original function
        Error.captureStackTrace = originalCaptureStackTrace;
    });
});
