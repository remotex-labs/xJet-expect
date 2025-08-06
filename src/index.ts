import { expect as old } from 'expect';
import { expect } from '@components/expect.component';
import { xJetExpectError } from '@errors/expect.error';
import { toHaveBeenCalledTimes, toHaveReturnedTimes } from '@matchers/mock.matcher';

const a: any = 'test2';
const b: any = {
    _isMockFunction: true,
    xJetMock: true,
    name: 'test',
    getMockName() {
        return this.name;
    },
    state: {
        calls: [
            [], []
        ],
        results: [],
        lastCall: undefined,
        contexts: [],
        instances: [],
        invocationCallOrder: []
    },
    get mock() {
        return this.state;
    }
};

async function f(): Promise<void> {
    try {
        old(b).toHaveReturnedTimes(2);
    } catch (e: any) {
        console.log(e.message);
    }

    console.log('\n\n-------------------------\n\n');

    try {
        expect(b).toHaveReturnedTimes(2);
    } catch (e: any) {
        console.log(e.message);
    }
}


f();
