/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { handleComparisonFailure } from '@handlers/matchers.handler';
import { ensurePositiveNumber, handleNumericComparison } from '@handlers/number.handler';

/**
 * Tests
 */

describe('Numeric matcher utilities', () => {
    const assertionChain = [ 'toBeGreaterThan' ];

    describe('handleNumericComparison', () => {
        beforeEach(() => {
            xJet.clearAllMocks();
            xJet.mock(handleComparisonFailure);
        });

        function createMatcherService(received: unknown, notModifier = false, macherName: string = '') {
            return {
                received,
                macherName,
                notModifier,
                assertionChain
            } as unknown as MatcherService<any>;
        }

        test('calls handleComparisonFailure with pass=true when comparison passes', () => {
            const matcherService = createMatcherService(10, undefined, 'toBeGreaterThan');
            handleNumericComparison.call(matcherService, 5, '>');
            expect(handleComparisonFailure).toHaveBeenCalledWith(
                expect.objectContaining({ pass: true }),
                '>'
            );
        });

        test('calls handleComparisonFailure with pass=false when comparison fails', () => {
            const matcherService = createMatcherService(2, undefined, 'toBeGreaterThan');
            handleNumericComparison.call(matcherService, 5, '>');
            expect(handleComparisonFailure).toHaveBeenCalledWith(
                expect.objectContaining({ pass: false }),
                '>'
            );
        });

        test('throws when expected value is invalid type', () => {
            const matcherService = createMatcherService(5);
            expect(() => handleNumericComparison.call(matcherService, 'invalid' as any, '>')).toThrow(
                xJetTypeError
            );
        });

        test('throws when received value is invalid type', () => {
            const matcherService = createMatcherService('invalid' as any);
            expect(() => handleNumericComparison.call(matcherService, 5, '>')).toThrow(xJetTypeError);
        });

        test('correctly handles all supported operators', () => {
            const matcherService = createMatcherService(5, undefined, 'matcher');

            handleNumericComparison.call(matcherService, 5, '>');
            expect(handleComparisonFailure).toHaveBeenLastCalledWith(expect.objectContaining({ pass: false }), '>');

            handleNumericComparison.call(matcherService, 5, '>=');
            expect(handleComparisonFailure).toHaveBeenLastCalledWith(expect.objectContaining({ pass: true }), '>=');

            handleNumericComparison.call(matcherService, 5, '<');
            expect(handleComparisonFailure).toHaveBeenLastCalledWith(expect.objectContaining({ pass: false }), '<');

            handleNumericComparison.call(matcherService, 5, '<=');
            expect(handleComparisonFailure).toHaveBeenLastCalledWith(expect.objectContaining({ pass: true }), '<=');
        });

        test('pass is false for unknown operators', () => {
            const matcherService = createMatcherService(5);
            handleNumericComparison.call(matcherService, 5, 'unknown' as any);
            expect(handleComparisonFailure).toHaveBeenCalledWith(expect.objectContaining({ pass: false }), 'unknown');
        });
    });
});


describe('ensurePositiveNumber', () => {
    // Minimal fake to satisfy "this" binding
    let matcherServiceMock: MatcherService;

    beforeEach(() => {
        matcherServiceMock = <MatcherService> <unknown> {
            assertionChain: [ 'test-chain' ]
        };
    });

    test('should not throw for a positive number', () => {
        expect(() =>
            ensurePositiveNumber.call(matcherServiceMock, 5, 'Received')
        ).not.toThrow();
    });

    test('should not throw for zero', () => {
        expect(() =>
            ensurePositiveNumber.call(matcherServiceMock as MatcherService, 0, 'Expected')
        ).not.toThrow();
    });

    test('should throw xJetTypeError for negative number with label "Received"', () => {
        expect(() =>
            ensurePositiveNumber.call(matcherServiceMock as MatcherService, -10, 'Received')
        ).toThrow(xJetTypeError);
    });

    test('should throw xJetTypeError for negative number with label "Expected" and include correct details', () => {
        try {
            ensurePositiveNumber.call(matcherServiceMock as MatcherService, -1, 'Expected', [ 'MyLabel' ]);
            fail('Expected error was not thrown');
        } catch (err: any) {
            expect(err).toBeInstanceOf(xJetTypeError);

            // The message will depend on EXPECTED() real output
            expect(err.message).toMatch(/Expected.*value must be positive number/);

            // The `expected` field should be set (for label === 'Expected')
            expect(err.message).toContain('-1');
            expect(err.message).toContain('Expected has type:  number');
        }
    });

    test('should pass through bigint values when positive', () => {
        expect(() =>
            ensurePositiveNumber.call(matcherServiceMock as MatcherService, 10n, 'Expected')
        ).not.toThrow();
    });

    test('should throw for negative bigint values', () => {
        expect(() =>
            ensurePositiveNumber.call(matcherServiceMock as MatcherService, -10n, 'Expected')
        ).toThrow(xJetTypeError);
    });
});
