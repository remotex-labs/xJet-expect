# Modifiers

Modifiers adapt a matcher before it runs. They sit between `xExpect()` and the matcher, letting you negate an
assertion or unwrap a Promise. They also chain, so `.resolves.not` and `.rejects.not` are valid.

| Modifier    | Effect                                                     |
|-------------|------------------------------------------------------------|
| `.not`      | Inverts the matcher - passes when it would otherwise fail. |
| `.resolves` | Waits for a Promise to fulfill, then matches its value.    |
| `.rejects`  | Waits for a Promise to reject, then matches the reason.    |

## .not

Inverts the assertion, so it passes when the underlying matcher would fail.

```ts
test('verifies incorrect password is rejected', () => {
    xExpect(authenticate('user', 'wrong_password')).not.toBeTruthy();
    xExpect(component.getStatus()).not.toBe('ready');
});
```

## .resolves

Unwraps a fulfilled Promise so you can assert on its resolved value. Always `await` (or `return`) the assertion so
the test waits for it.

```ts
test('API request completes successfully', async () => {
    await xExpect(api.fetchData('/users')).resolves.toMatchObject({
        success: true,
        count: xExpect.any(Number)
    });
});
```

::: tip Prefer async/await
The `await` form reads more clearly than returning the assertion, and it lets you run further checks after the
Promise resolves. Reach for `return xExpect(...).resolves...` only when the test body is a single expression.
:::

## .rejects

Asserts that a Promise rejects, and matches the rejection reason. It treats an explicit `reject(...)` and a `throw`
inside the executor the same way.

```ts
// Explicit rejection
function explicitReject(): Promise<unknown> {
    return new Promise((resolve, reject) => {
        reject('error message');
    });
}

// Throwing inside the executor
function throwInPromise(): Promise<unknown> {
    return new Promise(() => {
        throw 'error message';
    });
}

test('promise rejection patterns', async () => {
    await xExpect(explicitReject()).rejects.toBe('error message');
    await xExpect(throwInPromise()).rejects.toBe('error message');
});
```

Match the reason with `toBe` for an exact value, or `toThrow` for an error message or type.

```ts
test('asserting on the rejection reason', async () => {
    await xExpect(Promise.reject('validation failed')).rejects.toBe('validation failed');
    await xExpect(Promise.reject(new Error('network error'))).rejects.toThrow('network error');
    await xExpect(Promise.reject(new Error('network error'))).rejects.toBeInstanceOf(Error);
});
```

::: info When to use toThrow
For `Error` objects, prefer `toThrow` over `toBe`: it matches by message or constructor and produces clearer
failure output than comparing the whole object. See [Functions & Errors](/matchers/functions).
:::

## Combining modifiers

```ts
test('combined modifiers', async () => {
    // Resolves to a non-null value
    await xExpect(storage.getSettings()).resolves.not.toBeNull();

    // Does not throw on valid input
    xExpect(() => parser.parseConfig('{"valid": true}')).not.toThrow();

    // Does not resolve to a specific error state
    await xExpect(permissions.check('admin')).resolves.not.toEqual({ denied: true });
});
```

## See also

- [Functions & Errors](/matchers/functions) - `toThrow` pairs with `.rejects`
- [Asymmetric matchers](/guide/asymmetric)
- [Getting Started](/guide/)
