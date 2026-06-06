# Mock & Spy Matchers

Mock matchers assert how a mock function was used - whether it was called, with which arguments, how many times,
and what it returned. Create a mock with `xJet.fn()` (provided globally by the runner).

| Matcher                    | Asserts on                         |
|----------------------------|------------------------------------|
| `toHaveBeenCalled`         | At least one call                  |
| `toHaveBeenCalledTimes`    | The exact number of calls          |
| `toHaveBeenCalledWith`     | Arguments on any call              |
| `toHaveBeenLastCalledWith` | Arguments on the most recent call  |
| `toHaveBeenNthCalledWith`  | Arguments on the n-th call         |
| `toHaveReturned`           | At least one non-throwing return   |
| `toHaveReturnedTimes`      | The number of non-throwing returns |
| `toHaveLastReturnedWith`   | The most recent return value       |
| `toHaveNthReturnedWith`    | The n-th return value              |

::: tip Supports asymmetric matchers
Every matcher here that takes arguments or return values accepts [asymmetric matchers](/guide/asymmetric), such as
`xExpect.any()` and `xExpect.objectContaining()`.
:::

## toHaveBeenCalled

Checks that the mock was called at least once.

```ts
const mockFn = xJet.fn();
mockFn();
xExpect(mockFn).toHaveBeenCalled();

const unused = xJet.fn();
xExpect(unused).not.toHaveBeenCalled();
```

## toHaveBeenCalledTimes

Checks that the mock was called exactly `expectedCount` times.

```ts
const mockFn = xJet.fn();
mockFn();
mockFn();
mockFn();

xExpect(mockFn).toHaveBeenCalledTimes(3);
xExpect(mockFn).not.toHaveBeenCalledTimes(2);
```

## toHaveBeenCalledWith

Checks that the mock was called with the given arguments on at least one call.

```ts
const mockFn = xJet.fn();

mockFn('hello', 123);
xExpect(mockFn).toHaveBeenCalledWith('hello', 123);

// Matched across multiple calls
mockFn('first call');
mockFn('second call');
xExpect(mockFn).toHaveBeenCalledWith('first call');
xExpect(mockFn).not.toHaveBeenCalledWith('never called');

// With asymmetric matchers
mockFn('hello world', { id: 123, data: [ 1, 2, 3 ] });
xExpect(mockFn).toHaveBeenCalledWith(
    xExpect.stringContaining('hello'),
    xExpect.objectContaining({ id: 123 })
);
```

## toHaveBeenLastCalledWith

Checks the arguments of the **most recent** call.

```ts
const mockFn = xJet.fn();

mockFn('first call');
mockFn('last call');

xExpect(mockFn).toHaveBeenLastCalledWith('last call');
xExpect(mockFn).not.toHaveBeenLastCalledWith('first call');
```

## toHaveBeenNthCalledWith

Checks the arguments of the `n`-th call. `n` is **1-based**.

```ts
const mockFn = xJet.fn();

mockFn('first');
mockFn('second');
mockFn('third');

xExpect(mockFn).toHaveBeenNthCalledWith(1, 'first');
xExpect(mockFn).toHaveBeenNthCalledWith(2, 'second');
xExpect(mockFn).not.toHaveBeenNthCalledWith(2, 'first');
```

## toHaveReturned

Checks that the mock returned normally (without throwing) at least once.

```ts
const success = xJet.fn(() => true);
success();
xExpect(success).toHaveReturned();

const fail = xJet.fn(() => { throw new Error('Failed'); });
try { fail(); } catch { /* ignore */ }
xExpect(fail).not.toHaveReturned();
```

## toHaveReturnedTimes

Checks that the mock returned normally exactly `expectedCount` times. Calls that throw are not counted.

```ts
const mixed = xJet.fn((x: number) => {
    if (x < 0) throw new Error('Negative');

    return x * 2;
});

mixed(1);
try { mixed(-1); } catch { /* ignore */ }
mixed(2);

xExpect(mixed).toHaveReturnedTimes(2); // only the successful returns
```

## toHaveLastReturnedWith

Checks the **most recent** return value.

```ts
const mockFn = xJet.fn()
    .mockReturnValueOnce('first')
    .mockReturnValue('default');

mockFn(); // 'first'
mockFn(); // 'default'

xExpect(mockFn).toHaveLastReturnedWith('default');
xExpect(mockFn).not.toHaveLastReturnedWith('first');
```

## toHaveNthReturnedWith

Checks the return value of the `n`-th call. `n` is **1-based**.

```ts
const mockFn = xJet.fn()
    .mockReturnValueOnce('first')
    .mockReturnValueOnce('second');

mockFn();
mockFn();

xExpect(mockFn).toHaveNthReturnedWith(1, 'first');
xExpect(mockFn).toHaveNthReturnedWith(2, 'second');

// With asymmetric matchers
const complex = xJet.fn().mockReturnValueOnce({ type: 'user', data: { id: 1 } });
complex();
xExpect(complex).toHaveNthReturnedWith(1, xExpect.objectContaining({ type: 'user' }));
```

## Common patterns

```ts
test('callback is invoked with the correct arguments', () => {
    const onChange = xJet.fn();

    const input = { value: '', setValue(v: string) { this.value = v; onChange(v); } };
    input.setValue('hello');

    xExpect(onChange).toHaveBeenCalledWith('hello');
});

test('operations run in the correct order', () => {
    const logger = xJet.fn();

    logger('Starting');
    logger('Processing');
    logger('Completed');

    xExpect(logger).toHaveBeenNthCalledWith(1, 'Starting');
    xExpect(logger).toHaveBeenNthCalledWith(3, 'Completed');
    xExpect(logger).toHaveBeenCalledTimes(3);
});
```

## See also

- [Asymmetric matchers](/guide/asymmetric) - flexible argument matching
- [Modifiers](/guide/modifiers) - `.resolves` / `.rejects` for async mocks
- [Functions & Errors](/matchers/functions)
