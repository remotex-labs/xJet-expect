/**
 * Imports
 */

import { xJetExpectError } from '@errors/expect.error';
import { EXPECTED, RECEIVED } from '@components/color.component';
import { toHaveNthReturnedWith, toHaveReturned, toHaveReturnedTimes } from '@matchers/mock.matcher';
import { toHaveBeenCalled, toHaveBeenCalledTimes, toHaveBeenCalledWith } from '@matchers/mock.matcher';
import { toHaveBeenLastCalledWith, toHaveBeenNthCalledWith, toHaveLastReturnedWith } from '@matchers/mock.matcher';

/**
 * Tests
 */

describe('toHaveBeenCalled', () => {
    test('passes when mock has been called at least once', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).not.toThrow();
    });

    test('fails when mock has not been called', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has not been called', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).not.toThrow();
    });

    test('fails with .not when mock has been called', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).toThrow(xJetExpectError);
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false // Not a mock
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalled.call(matcherService)).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        // Arrange
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalled.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected calls: >= ${ EXPECTED('1') }`);
                expect(error.message).toContain(`Received calls:    ${ RECEIVED('0') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        // Arrange
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalled.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected calls: ${ EXPECTED('0') }`);
                expect(error.message).toContain(`Received calls: ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalled',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalled.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveBeenCalled');
                expect(error.matcherResult?.received).toBe(mockState);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveBeenCalledTimes', () => {
    test('passes when mock has been called exactly expected times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).not.toThrow();
    });

    test('fails when mock has been called different number of times than expected', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has been called different number of times than expected', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).not.toThrow();
    });

    test('fails with .not when mock has been called exactly expected times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).toThrow(xJetExpectError);
    });

    test('works with zero calls', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 0)).not.toThrow();
    });

    test('works with bigint expected value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, BigInt(2))).not.toThrow();
    });

    test('throws when expected is negative', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, -1)).toThrow();
    });

    test('throws when expected is not a number or bigint', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, '2' as any)).toThrow();
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledTimes.call(matcherService, 2)).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledTimes.call(matcherService, 2);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected calls: ${ EXPECTED('2') }`);
                expect(error.message).toContain(`Received calls: ${ RECEIVED('1') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledTimes.call(matcherService, 2);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected calls: != ${ EXPECTED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledTimes',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledTimes.call(matcherService, 2);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveBeenCalledTimes');
                expect(error.matcherResult?.received).toBe(mockState);
                expect(error.matcherResult?.expected).toBe(2);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveBeenCalledWith', () => {
    test('passes when mock has been called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails when mock has not been called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has not been called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails with .not when mock has been called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('handles empty arguments correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[], [ 'arg1' ], [ 'arg2', 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService)).not.toThrow();
    });

    test('matches call with complex objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };

        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ obj1, obj2 ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, obj1, obj2)).not.toThrow();
    });

    test('correctly handles multiple matching calls', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'arg1' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails when argument count differs', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1' ], [ 'expected1', 'expected2', 'extra' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('works with zero calls', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenCalledWith.call(matcherService, 'arg1')).toThrow(xJetExpectError);
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'different1' ], [ 'different2', 'different3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('Expected:');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('Expected: not');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('1') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'different' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenCalledWith.call(matcherService, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveBeenCalledWith');
                expect(error.matcherResult?.received).toBe(mockState);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveBeenLastCalledWith', () => {
    test('passes when mock has been last called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails when mock has been last called with different arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'different1', 'different2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has been last called with different arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'different1', 'different2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails with .not when mock has been last called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'different1', 'different2' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('handles empty arguments correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ], []],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService)).not.toThrow();
    });

    test('matches last call with complex objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };

        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2', 'arg3' ], [ obj1, obj2 ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, obj1, obj2)).not.toThrow();
    });

    test('fails when argument count in last call differs', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'expected1', 'expected2', 'extra' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('fails when no calls have been made', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenLastCalledWith.call(matcherService, 'arg1')).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'different1', 'different2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('Expected:');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'different1', 'different2' ], [ 'expected1', 'expected2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenLastCalledWith.call(matcherService, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('Expected: not');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'expected1', 'expected2' ], [ 'different1', 'different2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenLastCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        const expectedArgs = [ 'expected1', 'expected2' ];

        try {
            toHaveBeenLastCalledWith.call(matcherService, ...expectedArgs);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveBeenLastCalledWith');
                expect(error.matcherResult?.received).toBe(mockState);
                expect(error.matcherResult?.expected).toEqual([ 'expected1', 'expected2' ]);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveBeenNthCalledWith', () => {
    test('passes when mock has been nth called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'expected1', 'expected2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails when mock has been nth called with different arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'different1', 'different2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has been nth called with different arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'different1', 'different2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2')).not.toThrow();
    });

    test('fails with .not when mock has been nth called with expected arguments', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'expected1', 'expected2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('handles empty arguments correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2)).not.toThrow();
    });

    test('matches nth call with complex objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };

        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ obj1, obj2 ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, obj1, obj2)).not.toThrow();
    });

    test('fails when argument count in nth call differs', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'expected1', 'expected2', 'extra' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('fails when nthCall is greater than the number of calls', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 3, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('fails when no calls have been made', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 1, 'expected1', 'expected2')).toThrow(xJetExpectError);
    });

    test('throws when nthCall is negative', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, -1, 'expected1', 'expected2')).toThrow();
    });

    test('throws when nthCall is zero', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 0, 'expected1', 'expected2')).toThrow();
    });

    test('throws when nthCall is not a number', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, '1' as any, 'expected1', 'expected2')).toThrow();
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 1, 'arg1')).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 1, 'arg1')).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveBeenNthCalledWith.call(matcherService, 1, 'arg1')).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'different1', 'different2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('nthCall: 2');
                expect(error.message).toContain('Expected:');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'expected1', 'expected2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('nthCall: 2');
                expect(error.message).toContain('Expected: not');
                expect(error.message).toContain('Received:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'different1', 'different2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveBeenNthCalledWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveBeenNthCalledWith.call(matcherService, 2, 'expected1', 'expected2');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveBeenNthCalledWith');
                expect(error.matcherResult?.received).toBe(mockState);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveReturned', () => {
    test('passes when mock has returned at least once', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).not.toThrow();
    });

    test('fails when mock has not returned', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has not returned', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).not.toThrow();
    });

    test('fails with .not when mock has returned', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow(xJetExpectError);
    });

    test('works with mixed return and throw results', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'return', value: 'result2' },
                    { type: 'throw', value: new Error('error3') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).not.toThrow();
    });

    test('handles undefined return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: [{ type: 'return', value: undefined }]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).not.toThrow();
    });

    test('handles null return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1 ],
                results: [{ type: 'return', value: null }]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).not.toThrow();
    });

    test('handles no results correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow(xJetExpectError);
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturned.call(matcherService)).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveReturned.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: >= ${ EXPECTED('1') }`);
                expect(error.message).toContain(`Received returns:    ${ RECEIVED('0') }`);
                expect(error.message).toContain(`Calls:               ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveReturned.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: ${ EXPECTED('0') }`);
                expect(error.message).toContain(`Received returns: ${ RECEIVED('2') }`);
                expect(error.message).toContain(`Calls: ${ RECEIVED('2') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturned',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveReturned.call(matcherService);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveReturned');
                expect(error.matcherResult?.received).toBe(mockState);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveReturnedTimes', () => {
    test('passes when mock has returned exactly the expected number of times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).not.toThrow();
    });

    test('fails when mock has returned a different number of times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 3)).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has returned a different number of times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 3)).not.toThrow();
    });

    test('fails with .not when mock has returned exactly the expected number of times', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).toThrow(xJetExpectError);
    });

    test('handles zero return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 0)).not.toThrow();
    });

    test('handles undefined return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: undefined },
                    { type: 'return', value: undefined }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).not.toThrow();
    });

    test('handles null return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: null },
                    { type: 'return', value: null }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).not.toThrow();
    });

    test('handles no results correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 0)).not.toThrow();
    });

    test('throws when expected is negative', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, -1)).toThrow();
    });

    test('throws when expected is not a number', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, '2' as any)).toThrow();
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveReturnedTimes.call(matcherService, 2)).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveReturnedTimes.call(matcherService, 3);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: ${ EXPECTED('3') }`);
                expect(error.message).toContain(`Received returns: ${ RECEIVED('2') }`);
                expect(error.message).toContain(`Calls:            ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveReturnedTimes.call(matcherService, 2);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: != ${ EXPECTED('2') }`);
                expect(error.message).toContain(`Calls:               ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveReturnedTimes',
            assertionChain: [ 'test' ]
        } as any;

        const expected = 3;

        try {
            toHaveReturnedTimes.call(matcherService, expected);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveReturnedTimes');
                expect(error.matcherResult?.received).toBe(mockState);
                expect(error.matcherResult?.expected).toBe(expected);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveLastReturnedWith', () => {
    test('passes when mock has last returned with expected value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'expected-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).not.toThrow();
    });

    test('fails when mock has last returned with different value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has last returned with different value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).not.toThrow();
    });

    test('fails with .not when mock has last returned with expected value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'expected-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow(xJetExpectError);
    });

    test('fails when mock has not returned at all', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'throw', value: new Error('error1') },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'throw', value: new Error('error3') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow(xJetExpectError);
    });

    test('fails when last call was a throw', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'throw', value: new Error('error3') }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow(xJetExpectError);
    });

    test('handles undefined return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: undefined }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, undefined)).not.toThrow();
    });

    test('handles null return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: null }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, null)).not.toThrow();
    });

    test('matches last return with complex objects', () => {
        const obj = { a: 1, b: { c: 2 } };

        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: obj }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, { a: 1, b: { c: 2 } })).not.toThrow();
    });

    test('handles no results correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow(xJetExpectError);
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveLastReturnedWith.call(matcherService, 'expected-result')).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: 'different-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveLastReturnedWith.call(matcherService, 'expected-result');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: ${ EXPECTED('"expected-result"') }`);
                expect(error.message).toContain('Received returns:');
                expect(error.message).toContain(`Returns: ${ RECEIVED('3') }`);
                expect(error.message).toContain(`Calls:   ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: 'expected-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveLastReturnedWith.call(matcherService, 'expected-result');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain(`Expected returns: not ${ EXPECTED('"expected-result"') }`);
                expect(error.message).toContain('Received returns:');
                expect(error.message).toContain(`Calls: ${ RECEIVED('3') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' },
                    { type: 'return', value: 'different-result' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveLastReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        const expected = 'expected-result';

        try {
            toHaveLastReturnedWith.call(matcherService, expected);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveLastReturnedWith');
                expect(error.matcherResult?.received).toBe(mockState);
                expect(error.matcherResult?.expected).toBe(expected);
            } else {
                throw error;
            }
        }
    });
});

describe('toHaveNthReturnedWith', () => {
    test('passes when mock has nth returned with expected value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'expected-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, 'expected-result')).not.toThrow();
    });

    test('fails when mock has nth returned with different value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, 'expected-result')).toThrow(xJetExpectError);
    });

    test('passes with .not when mock has nth returned with different value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, 'expected-result')).not.toThrow();
    });

    test('fails with .not when mock has nth returned with expected value', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'expected-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, 'expected-result')).toThrow(xJetExpectError);
    });

    test('fails when nth return does not exist', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 5, 'expected-result')).toThrow(xJetExpectError);
    });

    test('fails when nth call was a throw', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, 'expected-result')).toThrow(xJetExpectError);
    });

    test('handles undefined return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: undefined },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, undefined)).not.toThrow();
    });

    test('handles null return values correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: null },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, null)).not.toThrow();
    });

    test('matches nth return with complex objects', () => {
        const obj = { a: 1, b: { c: 2 } };

        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: obj },
                    { type: 'return', value: 'result3' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 2, { a: 1, b: { c: 2 } })).not.toThrow();
    });

    test('handles no results correctly', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [],
                contexts: [],
                instances: [],
                invocationCallOrder: [],
                results: []
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 1, 'expected-result')).toThrow(xJetExpectError);
    });

    test('throws when nthCall is negative', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, -1, 'expected-result')).toThrow();
    });

    test('throws when nthCall is zero', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 0, 'expected-result')).toThrow();
    });

    test('throws when nthCall is not a number', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'return', value: 'result2' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, '1' as any, 'expected-result')).toThrow();
    });

    test('throws when received is not a mock', () => {
        const notAMock = {
            name: 'notAMock',
            xJetMock: false
        };

        const matcherService = {
            received: notAMock,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 1, 'expected-result')).toThrow();
    });

    test('throws when received is undefined', () => {
        const matcherService = {
            received: undefined,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 1, 'expected-result')).toThrow();
    });

    test('throws when received is null', () => {
        const matcherService = {
            received: null,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        expect(() => toHaveNthReturnedWith.call(matcherService, 1, 'expected-result')).toThrow();
    });

    test('includes correct information in failure message - positive case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveNthReturnedWith.call(matcherService, 2, 'expected-result');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('nthCall: 2');
                expect(error.message).toContain(`Expected returns: ${ EXPECTED('"expected-result"') }`);
                expect(error.message).toContain('Received returns:');
                expect(error.message).toContain(`Returns: ${ RECEIVED('3') }`);
                expect(error.message).toContain(`Calls:   ${ RECEIVED('4') }`);
            } else {
                throw error;
            }
        }
    });

    test('includes correct information in failure message - negative case', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'expected-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: true,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        try {
            toHaveNthReturnedWith.call(matcherService, 2, 'expected-result');
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.message).toContain('nthCall: 2');
                expect(error.message).toContain(`Expected returns: not ${ EXPECTED('"expected-result"') }`);
                expect(error.message).toContain('Received returns:');
                expect(error.message).toContain(`Returns: ${ RECEIVED('3') }`);
                expect(error.message).toContain(`Calls:   ${ RECEIVED('4') }`);
            } else {
                throw error;
            }
        }
    });

    test('error includes correct matcherResult details', () => {
        const mockState = {
            name: 'mockFn',
            xJetMock: true,
            mock: {
                calls: [[ 'arg1' ], [ 'arg2' ], [ 'arg3' ], [ 'arg4' ]],
                contexts: [],
                instances: [],
                invocationCallOrder: [ 1, 2, 3, 4 ],
                results: [
                    { type: 'return', value: 'result1' },
                    { type: 'throw', value: new Error('error2') },
                    { type: 'return', value: 'different-result' },
                    { type: 'return', value: 'result4' }
                ]
            }
        };

        const matcherService = {
            received: mockState,
            notModifier: false,
            macherName: 'toHaveNthReturnedWith',
            assertionChain: [ 'test' ]
        } as any;

        const nthCall = 2;
        const expected = 'expected-result';

        try {
            toHaveNthReturnedWith.call(matcherService, nthCall, expected);
            fail('Expected to throw an error');
        } catch (error) {
            if (error instanceof xJetExpectError) {
                expect(error.matcherResult).toBeDefined();
                expect(error.matcherResult?.pass).toBe(false);
                expect(error.matcherResult?.name).toBe('toHaveNthReturnedWith');
                expect(error.matcherResult?.received).toBe(mockState);
                expect(error.matcherResult?.expected).toBe(expected);
            } else {
                throw error;
            }
        }
    });
});
