/**
 * Imports
 */

import { Matchers } from '@providers/matchers.provider';
import { Patterns } from '@providers/patterns.provider';
import { MatcherService } from '@services/matcher.service';
import { expect as exceptToTest } from '@components/expect.component';

/**
 * Mock dependencies
 */

jest.mock('@services/matcher.service');
jest.mock('@providers/matchers.provider', () => ({
    Matchers: {
        toBe: jest.fn(),
        toEqual: jest.fn()
    }
}));
jest.mock('@providers/patterns.provider', () => ({
    Patterns: {
        anything: jest.fn(),
        stringMatching: jest.fn()
    }
}));

/**
 * Tests
 */

describe('expect utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset the mock implementation for MatcherService
        (MatcherService as jest.Mock).mockClear();
        (MatcherService as jest.Mock).mockImplementation(function (this: any, actual: unknown) {
            this.actual = actual;
            this.invoke = jest.fn((key, matcherFn, ...args) => {
                return matcherFn.apply(this, [ this.actual, ...args ]);
            });

            return this;
        });
    });

    describe('coreExpect function', () => {
        test('should create a new MatcherService with the actual value', () => {
            const actual = 'test value';
            exceptToTest(actual);

            expect(MatcherService).toHaveBeenCalledWith(actual);
            expect(MatcherService).toHaveBeenCalledTimes(1);
        });

        test('should throw an error when multiple arguments are provided', () => {
            expect(() => {
                (exceptToTest as any)('first', 'second');
            }).toThrow('Expect takes at most one argument. Received 2 arguments instead.');

            expect(() => {
                (exceptToTest as any)('first', 'second', 'third');
            }).toThrow('Expect takes at most one argument. Received 3 arguments instead.');
        });
    });

    describe('Matcher methods', () => {
        test('should add matcher methods to MatcherService prototype', () => {
            // Check if the matchers are defined on the prototype
            Object.keys(Matchers).forEach(key => {
                exceptToTest(typeof (MatcherService.prototype as any)[key]).toBe('function');
            });
        });

        test('should correctly invoke matchers with the proper context and arguments', () => {
            const testValue = { key: 'value' };
            const expectedValue = { key: 'expected' };

            const expectInstance: any = exceptToTest(testValue);
            expectInstance.toBe(expectedValue);

            expect(expectInstance.invoke).toHaveBeenCalledWith(
                'toBe',
                Matchers.toBe,
                expectedValue
            );
        });
    });

    describe('Patterns integration', () => {
        test('should expose Patterns as static properties on the expect function', () => {
            // Check that Patterns are correctly assigned
            Object.keys(Patterns).forEach((key) => {
                const patternKey = key as keyof typeof Patterns;
                expect((<any> exceptToTest)[key]).toBe(Patterns[patternKey]);
            });
        });

        test('should allow using patterns with the expect function', () => {
            // Mock implementation for a pattern
            const mockPattern = Symbol('pattern');
            (Patterns.anything as jest.Mock).mockReturnValue(mockPattern);

            const matcher = Matchers.toBe as jest.Mock;

            // Use a pattern in an expectation
            const expectInstance: any = exceptToTest('some value');
            expectInstance.toBe(exceptToTest.anything());

            expect(Patterns.anything).toHaveBeenCalled();
            expect(expectInstance.invoke).toHaveBeenCalledWith(
                'toBe',
                matcher,
                mockPattern
            );
        });
    });

    describe('Integration test', () => {
        test('should work with chained expectations', () => {
            const mockInvoke = jest.fn();

            // Update the MatcherService mock to return this for chaining
            (MatcherService as jest.Mock).mockImplementation(function (this: any, actual: unknown) {
                this.actual = actual;
                this.invoke = mockInvoke;

                return this;
            });

            const value = 'test';
            const expectInstance: any = exceptToTest(value);

            // Call multiple matchers
            expectInstance.toBe('value1');
            expectInstance.toEqual('value2');

            expect(mockInvoke).toHaveBeenCalledTimes(2);
            expect(mockInvoke).toHaveBeenNthCalledWith(1, 'toBe', Matchers.toBe, 'value1');
            expect(mockInvoke).toHaveBeenNthCalledWith(2, 'toEqual', (<any> Matchers).toEqual, 'value2');
        });
    });
});
