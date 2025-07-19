import type { DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';
import { DiffTypes } from '@diff/providers/string.provider';
import { getStringDiff } from '@diff/components/string.component';

export function hasCommonDiff(diffs: Array<DiffSegmentType>, isMultiline: boolean = false): boolean {
    if (isMultiline) {
        // Important: Ignore common newline that was appended to multiline strings!
        const iLast = diffs.length - 1;

        return diffs.some(
            (diff, i) => diff[0] === DiffTypes.EQUAL && (i !== iLast || diff[1] !== '\n')
        );
    }

    return diffs.some(diff => diff[0] === DiffTypes.EQUAL);
}

export function getDiff(expected: unknown, received: unknown, expectedLabel: string, receivedLabel: string): string {
    if(typeof expected === 'string' && typeof received === 'string') {
        return getStringDiff(expected, received, expectedLabel, receivedLabel);
    }

    return '';
}
