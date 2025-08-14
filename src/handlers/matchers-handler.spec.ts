/**
 * Import will remove at compile time
 */

import type { MatcherService } from '@services/matcher.service';

/**
 * Imports
 */

import { xJetTypeError } from '@errors/type.error';
import { xJetExpectError } from '@errors/expect.error';
import { EXPECTED, INVERSE, RECEIVED } from '@components/color.component';
import { handleDiffFailure, handleFailure, serializeOneLine } from '@handlers/matchers.handler';
import { ensureNotNullish, ensureType, handleComparisonFailure } from '@handlers/matchers.handler';

/**
 * Tests
 */

describe('Matcher handlers', () => {
    function createMatcherService(
        received: unknown, notModifier = false, assertionChain = [ 'matcher' ], macherName: string = ''
    ): MatcherService {
        return {
            received,
            macherName,
            notModifier,
            assertionChain
        } as unknown as MatcherService;
    }

    describe('handleFailure', () => {
        test('throws xJetExpectError when shouldThrow true (pass=false, notModifier=false)', () => {
            const ms = createMatcherService('foo', false, undefined, 'testMatcher');
            const options = {
                pass: false,
                expected: 'bar',
                handleInfo(this: MatcherService, info: string[]) {
                    info.push('Info message');
                },
                handleNot(this: MatcherService, info: string[]) {
                    info.push('Not message');
                }
            };

            expect(() => handleFailure.call(ms, options)).toThrow(xJetExpectError);
            try {
                handleFailure.call(ms, options);
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetExpectError);
                expect(e.message).toContain('Info message');
                expect(e.matcherResult?.pass).toBe(false);
                expect(e.matcherResult?.name).toBe('testMatcher');
                expect(e.matcherResult?.expected).toBe('bar');
            }
        });

        test('throws xJetExpectError when shouldThrow true (pass=true, notModifier=true)', () => {
            const ms = createMatcherService('foo', true);
            const options = {
                pass: true,
                name: 'testMatcher',
                expected: 'bar',
                handleInfo(this: MatcherService, info: string[]) {
                    info.push('Info message');
                },
                handleNot(this: MatcherService, info: string[]) {
                    info.push('Not message');
                }
            };

            expect(() => handleFailure.call(ms, options)).toThrow(xJetExpectError);
            try {
                handleFailure.call(ms, options);
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetExpectError);
                expect(e.message).toContain('Not message');
            }
        });

        test('does NOT throw when shouldThrow false (pass=true, notModifier=false)', () => {
            const ms = createMatcherService('foo', false);
            const options = {
                pass: true,
                name: 'testMatcher'
            };

            expect(() => handleFailure.call(ms, options)).not.toThrow();
        });

        test('does NOT throw when shouldThrow false (pass=false, notModifier=true)', () => {
            const ms = createMatcherService('foo', true);
            const options = {
                pass: false,
                name: 'testMatcher'
            };

            expect(() => handleFailure.call(ms, options)).not.toThrow();
        });
    });

    describe('handleDiffFailure', () => {
        test('throws with diff and note when shouldThrow true', () => {
            const ms = createMatcherService('receivedVal', false);
            const options = {
                pass: false,
                name: 'diffMatcher',
                expected: 'expectedVal',
                note: 'Note about failure'
            };

            expect(() => handleDiffFailure.call(ms, options)).toThrow(xJetExpectError);

            try {
                handleDiffFailure.call(ms, options);
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetExpectError);
                expect(e.message).toContain('Note about failure');
                expect(e.message).toContain(EXPECTED(`- ${ INVERSE('expect') }edVal`));
                expect(e.message).toContain(RECEIVED(`+ ${ INVERSE('receiv') }edVal`));
            }
        });

        test('does NOT throw when shouldThrow false', () => {
            const ms = createMatcherService('receivedVal', true);
            const options = {
                pass: false,
                name: 'diffMatcher',
                expected: 'expectedVal'
            };

            expect(() => handleDiffFailure.call(ms, options)).not.toThrow();
        });
    });

    describe('handleComparisonFailure', () => {
        test('throws with formatted operator info when shouldThrow true', () => {
            const ms = createMatcherService(5, false);
            const options = {
                pass: false,
                name: 'compMatcher',
                expected: 10
            };
            const operator = '===';

            expect(() => handleComparisonFailure.call(ms, options, operator)).toThrow(
                xJetExpectError
            );

            try {
                handleComparisonFailure.call(ms, options, operator);
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetExpectError);
                expect(e.message).toContain('Expected: ===');
                expect(e.message).toContain('Received:');
            }
        });

        test('does NOT throw when shouldThrow false', () => {
            const ms = createMatcherService(5, true);
            const options = {
                pass: false,
                name: 'compMatcher',
                expected: 10
            };
            const operator = '===';

            expect(() =>
                handleComparisonFailure.call(ms, options, operator)
            ).not.toThrow();
        });
    });

    describe('ensureType', () => {
        const context = createMatcherService(123, false);

        test('does not throw if type matches allowed types', () => {
            expect(() => ensureType.call(context, 123, [ 'number' ], 'Expected')).not.toThrow();
            expect(() => ensureType.call(context, 'test', [ 'string' ], 'Received')).not.toThrow();
            expect(() => ensureType.call(context, BigInt(10), [ 'bigint' ], 'Expected')).not.toThrow();
        });

        test('throws xJetTypeError if type does not match allowed types', () => {
            expect(() =>
                ensureType.call(context, 123, [ 'string' ], 'Expected')
            ).toThrow(xJetTypeError);

            expect(() =>
                ensureType.call(context, true, [ 'string', 'number' ], 'Received')
            ).toThrow(xJetTypeError);
        });

        test('throws with correct message and error properties', () => {
            try {
                ensureType.call(context, true, [ 'string' ], 'Received');
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetTypeError);
                expect(e.message).toContain(RECEIVED('Received'));
                expect(e.message).toContain('string');
            }
        });
    });

    describe('ensureNotNullish', () => {
        const context = createMatcherService(123, false);

        test('does not throw for non-nullish values', () => {
            expect(() => ensureNotNullish.call(context, 0, 'Expected')).not.toThrow();
            expect(() => ensureNotNullish.call(context, false, 'Received')).not.toThrow();
            expect(() => ensureNotNullish.call(context, '', 'Expected')).not.toThrow();
            expect(() => ensureNotNullish.call(context, {}, 'Received')).not.toThrow();
        });

        test('throws xJetTypeError if value is null or undefined', () => {
            expect(() => ensureNotNullish.call(context, null, 'Expected')).toThrow(xJetTypeError);
            expect(() => ensureNotNullish.call(context, undefined, 'Received')).toThrow(xJetTypeError);
        });

        test('throws with correct message and error properties', () => {
            try {
                ensureNotNullish.call(context, null, 'Expected');
            } catch (e: any) {
                expect(e).toBeInstanceOf(xJetTypeError);
                expect(e.message).toContain(EXPECTED('Expected'));
                expect(e.message).toContain('null');
            }
        });
    });

    describe('serializeOneLine', () => {
        test('serializes simple values', () => {
            expect(serializeOneLine(123)).toContain('123');
            expect(serializeOneLine('abc')).toContain('abc');
            expect(serializeOneLine(true)).toContain('true');
        });

        test('serializes objects and arrays as a single-line string', () => {
            const obj = { a: 1, b: [ 2, 3 ] };
            const serialized = serializeOneLine(obj);
            expect(typeof serialized).toBe('string');
            expect(serialized).toMatch(/a/);
            expect(serialized).toMatch(/1/);
            expect(serialized).toMatch(/2/);
            expect(serialized).toMatch(/3/);
        });
    });
});
