/**
 * Imports
 */

import { xJetBaseError } from '@errors/base.error';

/**
 * Implementation
 */

class TestError extends xJetBaseError {
    constructor(message: string) {
        super(message);
        this.name = 'TestError';
    }
}

/**
 * Tests
 */

describe('xJetBaseError', () => {
    describe('constructor', () => {
        test('should set the error message correctly', () => {
            const errorMessage = 'Test error message';
            const error = new TestError(errorMessage);

            expect(error.message).toBe(errorMessage);
        });

        test('should set the name property correctly', () => {
            const error = new TestError('Test error');

            expect(error.name).toBe('TestError');
        });

        test('should be an instance of Error', () => {
            const error = new TestError('Test error');

            expect(error).toBeInstanceOf(Error);
        });

        test('should be an instance of xJetBaseError', () => {
            const error = new TestError('Test error');

            expect(error).toBeInstanceOf(xJetBaseError);
        });

        test('should capture stack trace if available', () => {
            const originalCaptureStackTrace = Error.captureStackTrace;
            const mockCaptureStackTrace = xJet.fn();
            Error.captureStackTrace = mockCaptureStackTrace;

            new TestError('Test error');

            expect(mockCaptureStackTrace).toHaveBeenCalled();

            // Restore original function
            Error.captureStackTrace = originalCaptureStackTrace;
        });
    });

    describe('toJSON', () => {
        test('should serialize error properties to a plain object', () => {
            const errorMessage = 'Test error message';
            const error = new TestError(errorMessage);
            const customProperty = 'custom value';

            // Add a custom property to the error
            (error as any).customProperty = customProperty;

            const serialized = error.toJSON();

            expect(serialized.name).toBe('TestError');
            expect(serialized.message).toBe(errorMessage);
            expect(serialized.stack).toBeDefined();
            expect(serialized.customProperty).toBe(customProperty);
        });

        test('should include name, message, and stack even if they are non-enumerable', () => {
            const error = new TestError('Test error');

            // Make properties non-enumerable
            Object.defineProperties(error, {
                name: { enumerable: false },
                message: { enumerable: false },
                stack: { enumerable: false }
            });

            const serialized = error.toJSON();

            expect(serialized.name).toBe('TestError');
            expect(serialized.message).toBe('Test error');
            expect(serialized.stack).toBeDefined();
        });

        test('should skip null or undefined properties', () => {
            const error = new TestError('Test error');

            // Add properties with null/undefined values
            (error as any).nullProperty = null;
            (error as any).undefinedProperty = undefined;

            const serialized = error.toJSON();

            expect(serialized.nullProperty).toBeUndefined();
            expect(serialized.undefinedProperty).toBeUndefined();
        });

        test('should produce an object that can be JSON stringified', () => {
            const error = new TestError('Test error');
            const serialized = error.toJSON();

            // This should not throw
            const jsonString = JSON.stringify(serialized);

            expect(typeof jsonString).toBe('string');
            expect(JSON.parse(jsonString)).toEqual(expect.objectContaining({
                name: 'TestError',
                message: 'Test error'
            }));
        });
    });
});
