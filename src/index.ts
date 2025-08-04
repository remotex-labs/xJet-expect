import { expect as old } from 'expect';
import { expect } from '@components/expect.component';
import { xJetExpectError } from '@errors/expect.error';

const a: any = 'test2';
const b: any = () => {
     throw 42;
};

async function f(): Promise<void> {
    try {
        old(b).toThrow(a);
    } catch (e: any) {
        console.log(e.message);
    }

    console.log('\n\n-------------------------\n\n');

    try {
        expect(b).toThrow(a);
    } catch (e: any) {
        console.log(e.message);
    }
}


f();
