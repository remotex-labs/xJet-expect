/**
 * Imports
 */

import { DIM } from '@components/color.component';

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

        test('should return ansi when NO_COLOR is not set', () => {
            delete globalThis.NO_COLOR;
            expect(DIM('test')).not.toBe('test');
        });

        test('should return text when NO_COLOR is true', () => {
            globalThis.NO_COLOR = true;
            expect(DIM('test')).toBe('test');
        });
    });
});
