/**
 * Import will remove at compile time
 */

import type { FunctionLikeType } from '@interfaces/function.interface';
import type { HintOptionsInterface } from '@services/interfaces/format-service.interface';

/**
 * Imports
 */

import { xterm } from '@remotex-labs/xansi';


export const DIM_COLOR = xterm.dim;
export const BOLD_WEIGHT = xterm.bold;
export const RECEIVED_COLOR = xterm.red;
export const EXPECTED_COLOR = xterm.green;
export const INVERTED_COLOR = xterm.inverse;

export function getType(value: unknown): string {
    if (value === null) return 'null';

    return value && typeof value === 'object' ? value.constructor?.name ?? 'Object' : typeof value;
}

export function stringify(obj: unknown, maxDepth: number = 3): string {
    const seen = new WeakSet();
    const stack: Array<unknown> = [];

    const replacer = function (this: unknown, key: string, value: unknown): unknown {
        if (value instanceof Error) {
            return `[Error:${ value.message }]`;
        }

        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
        }

        while (stack.length && this !== stack[stack.length - 1]) {
            stack.pop();
        }

        if (typeof value === 'object' && value !== null) {
            if (stack.length >= maxDepth) return '[Object]';
            stack.push(value);
        }

        return value;
    };

    return String(JSON.stringify(obj, replacer, 0)?.replace(/:/g, ': '));
}

export function formatErrorMessage(hint: string, errorMessage: string, title?: string, detailedInfo?: string): string {
    title = title ?  `${ BOLD_WEIGHT(title) }: ` : '';

    return `${ hint }\n\n${ title }${ errorMessage }${
        typeof detailedInfo === 'string' ? `\n\n${ detailedInfo }` : ''
    }`;
}

export function formatWithType<T = unknown>(name: string, value: T, print: FunctionLikeType<string, [ T ]>): string {
    const type = getType(value);
    const hasType = (type !== 'null') && (type !== 'undefined')
        ? `${ name } has type: ${ type }\n`
        : '';

    return hasType + `${ name } has value: ${ print(value) }`;
}

export function formatHint(name: string, received: unknown = 'received', expected: unknown = 'expected', options: HintOptionsInterface = {}): string {
    const {
        isNot = false,
        comment = '',
        promise = '',
        secondArgument = '',
        isDirectExpectCall = false,
        expectedColor = EXPECTED_COLOR,
        receivedColor = RECEIVED_COLOR,
        secondArgumentColor = EXPECTED_COLOR
    } = options;

    if (expected === null) expected = 'null';
    if (received === null) received = 'null';

    // Use string template literals and array for better performance with concatenation
    const parts: string[] = [];

    // Start with expect(<received>)
    if (!isDirectExpectCall && received) {
        parts.push(DIM_COLOR('expect('));
        parts.push(receivedColor(received as string));
        parts.push(DIM_COLOR(')'));
    } else {
        parts.push('expect');
    }

    // Add promise modifier (e.g. .resolves, .rejects)
    if (promise) {
        parts.push(DIM_COLOR('.'));
        parts.push(promise);
    }

    // Add .not if used
    if (isNot) {
        parts.push(DIM_COLOR('.'));
        parts.push('not');
    }

    // Add matcher name
    if (name.includes('.')) {
        parts.push(name);
    } else {
        parts.push(DIM_COLOR('.'));
        parts.push(name);
    }

    // Add arguments
    if (!expected) {
        parts.push(DIM_COLOR('()'));
    } else {
        parts.push(DIM_COLOR('('));
        parts.push(expectedColor(expected as string));

        if (secondArgument) {
            parts.push(DIM_COLOR(', '));
            parts.push(secondArgumentColor(secondArgument));
        }

        parts.push(DIM_COLOR(')'));
    }

    // Add optional comment
    if (comment) {
        parts.push(DIM_COLOR(` // ${ comment }`));
    }

    return parts.join('');
}

export function formatExpected(object: unknown): string {
    return EXPECTED_COLOR(typeof object === 'string' ? object : stringify(object));
}

export function formatReceived(object: unknown): string {
    return RECEIVED_COLOR(typeof object === 'string' ? object : stringify(object));
}

