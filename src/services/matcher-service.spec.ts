/**
 * Imports
 */


import { AssertionError } from '@errors/assertion.error';
import { MatcherService } from '@services/matcher.service';
import * as formatComponent from '@services/format.service';
import * as promiseComponent from '@components/promise.component';

/**
 * Mock dependencies
 */

jest.mock('@services/format.service', () => ({
    formatHint: jest.fn().mockReturnValue('formatted hint'),
    formatReceived: jest.fn().mockReturnValue('formatted received'),
    formatWithType: jest.fn().mockReturnValue('formatted with type'),
    formatErrorMessage: jest.fn().mockReturnValue('formatted error message'),
    RECEIVED_COLOR: jest.fn().mockReturnValue('colored received')
}));

jest.mock('@components/promise.component', () => ({
    isPromise: jest.fn()
}));

/**
 * Tests
 */
describe('MatcherService', () => {
    let matcherService: MatcherService;
    let mockMatcher: jest.Mock;

    beforeEach(() => {
        jest.restoreAllMocks();
        mockMatcher = jest.fn();
        (promiseComponent.isPromise as unknown as jest.Mock).mockReturnValue(true);
    });

    describe('Modifiers', () => {
        test('should set notModifiers to true when using not modifier', () => {
            matcherService = new MatcherService('test value');
            const result = matcherService.not;

            expect(result).toBe(matcherService);
            expect((matcherService as any).notModifiers).toBe(true);
        });

        test('should set rejectsModifiers to true when using rejects modifier', () => {
            matcherService = new MatcherService('test value');
            const result = matcherService.rejects;

            expect(result).toBe(matcherService);
            expect((matcherService as any).rejectsModifiers).toBe(true);
        });

        test('should set resolvesModifiers to true when using resolves modifier', () => {
            matcherService = new MatcherService('test value');
            const result = matcherService.resolves;

            expect(result).toBe(matcherService);
            expect((matcherService as any).resolvesModifiers).toBe(true);
        });

        test('should throw error when using rejects after resolves', () => {
            matcherService = new MatcherService('test value');
            const result: any = matcherService.resolves;

            expect(result.resolvesModifiers).toBe(true);
            expect(() => matcherService.rejects).toThrow('Cannot use "rejects" modifier after "resolved" modifier.');
        });

        test('should throw error when using resolves after rejects', () => {
            matcherService = new MatcherService('test value');
            const result: any = matcherService.rejects;

            expect(result.rejectsModifiers).toBe(true);
            expect(() => matcherService.resolves).toThrow('Cannot use "resolved" modifier after "rejects" modifier.');
        });
    });

    describe('invoke method', () => {
        test('should call matcher directly when no promise modifiers are used', () => {
            matcherService = new MatcherService('test value');
            (matcherService as any).invoke('testMatcher', mockMatcher, [ 'arg1', 'arg2' ]);

            expect(mockMatcher).toHaveBeenCalledWith([ 'arg1', 'arg2' ]);
        });

        test('should call invokeAsync when rejectsModifiers is true', () => {
            matcherService = new MatcherService('test value');
            const result: any = matcherService.rejects;
            const invokeAsyncSpy = jest.spyOn(MatcherService.prototype as any, 'invokeAsync').mockResolvedValue(undefined);

            (matcherService as any).invoke('testMatcher', mockMatcher, [ 'arg1', 'arg2' ]);

            expect(result.rejectsModifiers).toBe(true);
            expect(invokeAsyncSpy).toHaveBeenCalledWith('testMatcher', mockMatcher, [ 'arg1', 'arg2' ]);
        });

        test('should call invokeAsync when resolvesModifiers is true', () => {
            matcherService = new MatcherService('test value');
            const result: any = matcherService.resolves;
            const invokeAsyncSpy = jest.spyOn(MatcherService.prototype as any, 'invokeAsync').mockResolvedValue(undefined);

            (matcherService as any).invoke('testMatcher', mockMatcher, [ 'arg1', 'arg2' ]);

            expect(result.resolvesModifiers).toBe(true);
            expect(invokeAsyncSpy).toHaveBeenCalledWith('testMatcher', mockMatcher, [ 'arg1', 'arg2' ]);
        });
    });

    describe('invokeAsync method', () => {
        test('should throw AssertionError when value is not a promise', async () => {
            (promiseComponent.isPromise as unknown as jest.Mock).mockReturnValue(false);
            matcherService = new MatcherService('test value');
            const result: any = matcherService.resolves;

            await expect((matcherService as any).invokeAsync('testMatcher', mockMatcher, [])).rejects.toThrow(AssertionError);
            expect(result.resolvesModifiers).toBe(true);
            expect(formatComponent.formatErrorMessage).toHaveBeenCalled();
        });

        test('should handle resolved promise with resolves modifier', async () => {
            const resolvedValue = 'resolved value';
            const mockPromise = Promise.resolve(resolvedValue);
            matcherService = new MatcherService(mockPromise);
            const result: any = matcherService.resolves;

            await (matcherService as any).invokeAsync('testMatcher', mockMatcher, []);

            expect(mockMatcher).toHaveBeenCalled();
            expect(result.resolvesModifiers).toBe(true);
            expect((matcherService as any).actual).toBe(resolvedValue);
        });

        test('should handle rejected promise with rejects modifier', async () => {
            const rejectedValue = new Error('rejected error');
            const mockPromise = Promise.reject(rejectedValue);
            matcherService = new MatcherService(mockPromise);
            const result: any = matcherService.rejects;

            await (matcherService as any).invokeAsync('testMatcher', mockMatcher, []);

            expect(mockMatcher).toHaveBeenCalled();
            expect(result.rejectsModifiers).toBe(true);
            expect((matcherService as any).actual).toBe(rejectedValue);
        });

        test('should throw AssertionError when promise resolves but rejectsModifiers is true', async () => {
            const resolvedValue = 'resolved value';
            const mockPromise = Promise.resolve(resolvedValue);
            matcherService = new MatcherService(mockPromise);
            const result: any = matcherService.rejects;

            await expect((matcherService as any).invokeAsync('testMatcher', mockMatcher, [])).rejects.toThrow(AssertionError);
            expect(result.rejectsModifiers).toBe(true);
            expect(formatComponent.formatErrorMessage).toHaveBeenCalled();
        });

        test('should throw AssertionError when promise rejects but resolvesModifiers is true', async () => {
            const rejectedValue = new Error('rejected error');
            const mockPromise = Promise.reject(rejectedValue);
            matcherService = new MatcherService(mockPromise);
            const result: any = matcherService.resolves;

            await expect((matcherService as any).invokeAsync('testMatcher', mockMatcher, [])).rejects.toThrow(AssertionError);
            expect(result.resolvesModifiers).toBe(true);
            expect(formatComponent.formatErrorMessage).toHaveBeenCalled();
        });

        test('should call function if actual is a function', async () => {
            const resolvedValue = 'resolved value';
            const mockFunction = jest.fn().mockResolvedValue(resolvedValue);
            matcherService = new MatcherService(mockFunction);
            const result: any = matcherService.resolves;

            await (matcherService as any).invokeAsync('testMatcher', mockMatcher, []);

            expect(mockFunction).toHaveBeenCalled();
            expect(mockMatcher).toHaveBeenCalled();
            expect(result.resolvesModifiers).toBe(true);
            expect((matcherService as any).actual).toBe(resolvedValue);
        });
    });
});
