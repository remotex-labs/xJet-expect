/**
 * Imports
 */


import { xJetTypeError } from '@errors/type.error';
import { xJetPromiseError } from '@errors/promise.error';
import { MatcherService } from '@services/matcher.service';

/**
 * Tests
 */

describe('MatcherService', () => {
    const dummyMatcher = jest.fn();
    globalThis.NO_COLOR = true;

    beforeEach(() => {
        dummyMatcher.mockReset();
    });

    describe('modifiers', () => {
        test('.rejects sets rejectsModifier and throws if resolvesModifier already set', () => {
            const matcher = new MatcherService('foo');

            // Set resolvesModifier first
            matcher['resolvesModifier'] = true;
            expect(() => matcher.rejects).toThrow('Cannot use "rejects" modifier after "resolved" modifier.');

            // Now test normal behavior
            matcher['resolvesModifier'] = false;
            const result = matcher.rejects;
            expect(result).toBe(matcher);
            expect(matcher['rejectsModifier']).toBe(true);
        });

        test('.resolves sets resolvesModifier and throws if rejectsModifier already set', () => {
            const matcher = new MatcherService('foo');

            // Set rejectsModifier first
            matcher['rejectsModifier'] = true;

            expect(() => matcher.resolves).toThrow('Cannot use "resolved" modifier after "rejects" modifier.');

            // Now test normal behavior
            matcher['rejectsModifier'] = false;
            const result = matcher.resolves;
            expect(result).toBe(matcher);
            expect(matcher['resolvesModifier']).toBe(true);
        });
    });

    describe('invoke', () => {
        test('sets promise to "resolves" when resolvesModifier is true', async () => {
            const matcher = new MatcherService(Promise.resolve('foo'));
            matcher['resolvesModifier'] = true;

            dummyMatcher.mockReturnValue('sync-result');

            await matcher['invoke']('toBe', dummyMatcher, [ 'bar' ]);

            expect(matcher['promise']).toBe('resolves');
            expect(dummyMatcher).toHaveBeenCalledWith('bar');
        });

        test('sets promise to "rejects" when rejectsModifier is true', async () => {
            const matcher = new MatcherService(Promise.reject('foo'));
            matcher['rejectsModifier'] = true;

            dummyMatcher.mockReturnValue('sync-result');

            await matcher['invoke']('toBe', dummyMatcher, [ 'bar' ]);

            expect(matcher['promise']).toBe('rejects');
            expect(dummyMatcher).toHaveBeenCalledWith('bar');
        });

        test('calls matcher synchronously when no async modifiers', () => {
            const matcher = new MatcherService('foo');

            dummyMatcher.mockReturnValue('sync-result');
            const result = matcher['invoke']('toBe', dummyMatcher, [ 'bar' ]);

            expect(dummyMatcher).toHaveBeenCalledWith('bar');
            expect(result).toBe('sync-result');
        });
    });

    describe('invokeAsync', () => {
        test('throws xJetTypeError if received is not a promise or function returning promise', async () => {
            const matcher = new MatcherService('not-a-promise');
            matcher['assertionChain'] = [ 'rejects', 'toThrow' ];

            await expect(matcher['invokeAsync'](dummyMatcher, [])).rejects.toBeInstanceOf(xJetTypeError);
        });

        test('awaits function that returns a promise', async () => {
            const promise = Promise.resolve('resolved-value');
            const fn = jest.fn(() => promise);

            const matcher = new MatcherService(fn);
            matcher['resolvesModifier'] = true;

            dummyMatcher.mockReturnValue(undefined);

            await matcher['invokeAsync'](dummyMatcher, []);

            expect(matcher['received']).toBe('resolved-value');
            expect(dummyMatcher).toHaveBeenCalled();
        });

        test('throws xJetPromiseError if resolvesModifier and promise rejects', async () => {
            const promise = Promise.reject('error-value');
            const fn = jest.fn(() => promise);

            const matcher = new MatcherService(fn);
            matcher['assertionChain'] = [ 'rejects', 'toThrow' ];
            matcher['resolvesModifier'] = true;

            dummyMatcher.mockReturnValue(undefined);

            await expect(matcher['invokeAsync'](dummyMatcher, [])).rejects.toBeInstanceOf(xJetPromiseError);
        });

        test('throws xJetPromiseError if rejectsModifier and promise resolves', async () => {
            const promise = Promise.resolve('resolved-value');

            const matcher = new MatcherService(promise);
            matcher['assertionChain'] = [ 'rejects', 'toThrow' ];
            matcher['rejectsModifier'] = true;

            dummyMatcher.mockReturnValue(undefined);

            await expect(matcher['invokeAsync'](dummyMatcher, [])).rejects.toBeInstanceOf(xJetPromiseError);
        });

        test('catches rejection and sets received if rejectsModifier', async () => {
            const errorValue = new Error('some error');
            const promise = Promise.reject(errorValue);

            const matcher = new MatcherService(promise);
            matcher['rejectsModifier'] = true;

            const dummyMatcher = jest.fn().mockReturnValue(undefined);
            await expect(matcher['invokeAsync'](dummyMatcher, [])).resolves.toBeUndefined();

            expect(matcher['received']).toBe(errorValue);
            expect(dummyMatcher).toHaveBeenCalledWith();
        });
    });

    describe('pushToChain', () => {
        test('adds modifiers and matcher name in correct order', () => {
            const matcher = new MatcherService('foo');

            matcher['promise'] = 'resolves';
            matcher['notModifier'] = true;

            matcher['pushToChain']('toBe');

            expect(matcher['assertionChain']).toEqual([ 'resolves', 'not', 'toBe' ]);
        });

        test('adds only matcher name if no modifiers', () => {
            const matcher = new MatcherService('foo');

            matcher['pushToChain']('toEqual');

            expect(matcher['assertionChain']).toEqual([ 'toEqual' ]);
        });
    });

    describe('throwPromiseError', () => {
        test('throws xJetPromiseError with proper message and data', () => {
            const matcher = new MatcherService('foo');
            matcher['assertionChain'] = [ 'rejects', 'toThrow' ];

            expect(() =>
                matcher['throwPromiseError']('Resolved', 'someValue')
            ).toThrow(xJetPromiseError);

            try {
                matcher['throwPromiseError']('Resolved', 'someValue');
            } catch (err) {
                expect(err).toBeInstanceOf(xJetPromiseError);
                expect((err as any).message).toContain('received promise resolved instead of rejected');
                expect((err as any).message).toContain('expect(received).rejects.toThrow()');
            }
        });
    });
});
