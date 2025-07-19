import type { DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';

/**
 * Imports
 */

import { xterm } from '@remotex-labs/xansi';
import { hasCommonDiff } from '@diff/components/diff.component';
import { cleanupSemantic } from '@components/semantic.component';
import { getAlignedLabel } from '@diff/components/format.component';
import { formatExpected, formatReceived } from '@services/format.service';
import { diffStringsRaw, DiffTypes } from '@diff/providers/string.provider';

export function extractFormattedDiff(diffs: Array<DiffSegmentType>, diffType: DiffTypes, hasCommon: boolean): string {
    return diffs.reduce((reduced: string, diff: DiffSegmentType): string => {
        if(diff[0] === DiffTypes.EQUAL) {
            reduced += diff[1];
        }

        if(diff[0] === diffType) {
            reduced += hasCommon ? xterm.inverse(diff[1]) : diff[1];
        }

        return reduced;
    }, '');
}

export function getStringMultiline(expected: string, received: string, expectedLabel: string, receivedLabel: string): string {
    const diffs = diffStringsRaw(expected + '\n', received + '\n');

    return '';
}


export function getStringDiff(expected: string, received: string, expectedLabel: string, receivedLabel: string): string {
    if(expected.includes('\n') || received.includes('\n')) {
        return getStringMultiline(expected, received, expectedLabel, receivedLabel);
    }

    const diffs = cleanupSemantic(diffStringsRaw(expected, received));
    const hasCommon = hasCommonDiff(diffs);
    const printLabel = getAlignedLabel(expectedLabel, receivedLabel);

    const expectedLine =
        printLabel(expectedLabel) +
        formatExpected(
            `"${ extractFormattedDiff(diffs, DiffTypes.DELETE, hasCommon) }"`
        );

    const receivedLine =
        printLabel(receivedLabel) +
        formatReceived(
            `"${ extractFormattedDiff(diffs, DiffTypes.INSERT, hasCommon) }"`
        );

    return `${ expectedLine }\n${ receivedLine }`;
}
