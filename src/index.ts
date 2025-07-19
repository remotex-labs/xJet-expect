import type { Diff } from 'jest-diff';
import type { DiffSegmentType } from '@diff/providers/interfaces/string-provider.interface';
import { expect as old } from 'expect';
import { diffStringsRaw as old2 } from 'jest-diff';
import { expect } from '@components/expect.component';
import { diffStringsRaw } from '@diff/providers/string.provider';


const Received = 'test avd end dzsa end';
const Expected = 'test vcs end ghzz end';

function printNice(data: Array<Diff>): void {
    const result = data.map(diff => {
        return [ diff['0'], diff['1'] ];
    });

    console.log('\nprintNice');
    console.log(result)
}

console.log(diffStringsRaw(Expected, Received));
printNice(old2(Expected, Received, false));

// console.log(diffStringsRaw(Expected, Received));
// printNice(old2(Expected, Received, true));

//
// try {
//     old(Received).toBe(Expected);
// } catch (e: any) {
//     console.log(e.message);
// }
//
// console.log('\n\n-------------------------\n\n');
//
// try {
//     expect(Received).toBe(Expected);
// } catch (e: any) {
//     console.log(e.message);
// }
