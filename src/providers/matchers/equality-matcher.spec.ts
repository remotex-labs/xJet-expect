/**
 * Imports
 */

import { toBe } from '@matchers/equality.matcher';
import { handleFailure } from '@matchers/base.matcher';

/**
 * Mock dependencies
 */

jest.mock('@matchers/base.matcher', () => {
    const originalModule = jest.requireActual('@matchers/base.matcher');

    return {
        handleFailure: jest.fn(originalModule.handleFailure)
    };
});

/**
 * Globals
 */

let matcherContext: any;

beforeAll(() => {
    globalThis.NO_COLOR = true;
});

afterAll(() => {
    delete globalThis.NO_COLOR;
});

beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup matcher context
    matcherContext = {
        actual: 'test-value',
        notModifiers: false,
        hintChain: []
    };
});

/**
 * Tests
 */

describe('toBe matcher', () => {
    test('should pass when values are strictly equal using Object.is', () => {
        const expected = 'test-value';

        toBe.call(matcherContext, expected);
        expect(handleFailure).toHaveBeenCalledWith({
            expected,
            pass: true,
            name: 'toBe',
            params: [ 'expected' ],
            hintLabel: 'Object.is equality'
        });
    });

    test('should fail when values are not strictly equal', () => {
        const expected = 'different-value';

        expect(() => toBe.call(matcherContext, expected)).toThrow();
        expect(handleFailure).toHaveBeenCalledWith({
            pass: false,
            expected,
            name: 'toBe',
            params: [ 'expected' ],
            hintLabel: 'Object.is equality'
        });
    });
});
