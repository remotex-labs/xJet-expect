/**
 * Imports
 */

import { isColorEnabled, wrap } from '@components/color.component';

/**
 * Tests
 */

describe('Color utility functions', () => {
    describe('isColorEnabled', () => {
        let originalNoColor: true | undefined;

        beforeEach(() => {
            originalNoColor = globalThis.NO_COLOR;
        });

        afterEach(() => {
            globalThis.NO_COLOR = originalNoColor;
        });

        test('should return true when NO_COLOR is not set', () => {
            delete globalThis.NO_COLOR;
            expect(isColorEnabled()).toBe(true);
        });

        test('should return true when NO_COLOR is false', () => {
            delete globalThis.NO_COLOR;
            expect(isColorEnabled()).toBe(true);
        });

        test('should return false when NO_COLOR is true', () => {
            globalThis.NO_COLOR = true;
            expect(isColorEnabled()).toBe(false);
        });
    });

    describe('wrap', () => {
        let originalNoColor: true | undefined;
        const mockStyleFn = jest.fn((text) => `STYLED_${ text }_STYLED`);

        beforeEach(() => {
            // Store the original NO_COLOR value
            originalNoColor = globalThis.NO_COLOR;
            mockStyleFn.mockClear();
        });

        afterEach(() => {
            // Reset to original value after each test
            globalThis.NO_COLOR = originalNoColor;
        });

        test('should apply styling when colors are enabled', () => {
            globalThis.NO_COLOR = undefined;

            const wrappedFn = wrap(mockStyleFn);
            const result = wrappedFn('test');

            expect(mockStyleFn).toHaveBeenCalledWith('test');
            expect(result).toBe('STYLED_test_STYLED');
        });

        test('should not apply styling when colors are disabled', () => {
            globalThis.NO_COLOR = true;

            const wrappedFn = wrap(mockStyleFn);
            const result = wrappedFn('test');

            expect(mockStyleFn).not.toHaveBeenCalled();
            expect(result).toBe('test');
        });

        test('should join multiple text arguments when colors are disabled', () => {
            globalThis.NO_COLOR = true;

            const wrappedFn = wrap(mockStyleFn);
            const result = wrappedFn('first', 'second', 'third');

            expect(mockStyleFn).not.toHaveBeenCalled();
            expect(result).toBe('firstsecondthird');
        });

        test('should pass multiple arguments to the style function when colors are enabled', () => {
            globalThis.NO_COLOR = undefined;

            const mockMultiArgStyleFn = jest.fn((...texts) => `STYLED_${ texts.join('_') }_STYLED`);
            const wrappedFn = wrap(mockMultiArgStyleFn);

            const result = wrappedFn('first', 'second', 'third');

            expect(mockMultiArgStyleFn).toHaveBeenCalledWith('first', 'second', 'third');
            expect(result).toBe('STYLED_first_second_third_STYLED');
        });
    });
});
