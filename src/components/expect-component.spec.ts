/**
 * Imports
 */

import { xExpect } from '@components/expect.component';
import { Matchers } from '@providers/matchers.provider';
import { MatcherService } from '@services/matcher.service';

/**
 * Mock dependencies
 */

jest.mock('@providers/matchers.provider', () => {
    return {
        Matchers: {
            // Provide mocked matcher functions here
            toBe: jest.fn(function (this: any, expected: unknown) {
                // You can simulate the behavior or just a placeholder
                return this.invoke('toBe', (actual: unknown) => actual === expected, [ expected ]);
            })
            // Add other matcher mocks if needed
        }
    };
});

/**
 * Tests
 */

describe('coreExpect function', () => {
    test('throws if more than one argument is passed', () => {
        expect(() => (xExpect as any)(1, 2)).toThrow(
            'Expect takes at most one argument. Received 2 arguments instead.'
        );
    });

    test('returns a MatcherService instance augmented with matcher methods', () => {
        const received = 42;
        const result = xExpect(received);

        // Should be an instance of MatcherService
        expect(result).toBeInstanceOf(MatcherService);

        // Should have all matcher methods dynamically added
        Object.keys(Matchers).forEach((matcherName) => {
            expect(typeof (result as any)[matcherName]).toBe('function');
        });
    });

    test('matcher method calls invoke with correct arguments', () => {
        const received = 'test';
        const matcherName = Object.keys(Matchers)[0];
        const matcherFn = (Matchers as any)[matcherName];

        // Spy on invoke method of MatcherService
        const result = xExpect(received);
        const invokeSpy = jest.spyOn(result as any, 'invoke');

        // Call the matcher method dynamically added
        (result as any)[matcherName]('arg1', 'arg2');

        expect(invokeSpy).toHaveBeenCalledWith(matcherName, matcherFn, [ 'arg1', 'arg2' ]);
    });
});
