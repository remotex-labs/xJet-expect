import type { MatcherService } from '@services/matcher.service';
import type { HintOptionsInterface } from '@services/interfaces/format-service.interface';
import { xterm } from '@remotex-labs/xansi';
import { equals } from '@components/object.component';
import { AssertionError } from '@errors/assertion.error';
import { getDiff } from '@diff/components/diff.component';
import { formatErrorMessage, formatExpected, formatHint, getType } from '@services/format.service';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

export function toBe(this: MatcherService, expected: unknown): void {
    const matcherName = 'toBe';
    const options: HintOptionsInterface = {
        isNot: this.notModifiers,
        promise: this.promise,
        comment: 'Object.is equality'
    };

    const pass = Object.is(this.actual, expected);
    const hint = formatHint(matcherName, undefined, undefined, options);

    if (pass && this.notModifiers) {
        const message = formatErrorMessage(hint, `not ${ formatExpected(`"${ expected }"`) }`, 'Expected');

        throw new AssertionError(message, {
            pass: pass,
            name: matcherName,
            message: message,
            expected: expected,
            received: this.actual
        });
    }

    if(this.notModifiers || pass) return;
    const passEquals = equals(this.actual, expected);

    const note = passEquals ? xterm.dim(
        `If it should pass with deep equality, replace "${ matcherName }" with "toEqual"\n\n`
    ) : '';

    const message = formatErrorMessage(
        hint, note + getDiff(expected, this.actual, EXPECTED_LABEL, RECEIVED_LABEL)
    );

    throw new AssertionError(message, {
        pass: pass,
        name: matcherName,
        message: message,
        expected: expected,
        received: this.actual
    });
}
