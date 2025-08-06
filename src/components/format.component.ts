/**
 * Imports
 */

import { DIM, EXPECTED, RECEIVED } from '@components/color.component';

//todo

export function hintComponent(name: string = 'received', chain: Array<string>, parameters: Array<string> = [ 'expected' ], comment?: string): string {
    if (chain.length < 1)
        throw new Error('Expected non-empty matcher chain (e.g., ["toEqual"]). Received an empty array.');

    const parts = [
        DIM('expect('),
        RECEIVED(name),
        DIM(')'),
        '.',
        chain.join('.')
    ];

    if (parameters.length > 0) {
        parts.push('(');
        parts.push(
            parameters.map(value => EXPECTED(value)).join(', ')
        );
        parts.push(')');
    } else {
        parts.push('()');
    }

    if (comment) {
        parts.push(DIM(' // ' + comment));
    }

    return parts.join('');
}
