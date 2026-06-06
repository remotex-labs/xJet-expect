# Function & Error Matchers

`toThrow` asserts that calling a function throws. Pass the function itself - not its result - so the matcher can
invoke it and catch the error.

## toThrow

Checks that a function throws when called, optionally matching the thrown error.

```ts
xExpect(fn).toThrow(expected?);
```

::: tip Supports asymmetric matchers
`expected` accepts [asymmetric matchers](/guide/asymmetric) such as `xExpect.objectContaining()`.
:::

`expected` is optional and selects how the thrown error is matched:

| `expected`  | Matches when                                     |
|-------------|--------------------------------------------------|
| *(omitted)* | The function throws anything                     |
| Constructor | The error is an instance of that class           |
| String      | The substring appears in the error message       |
| RegExp      | The pattern tests true against the error message |
| Object      | The thrown value matches the object              |

::: warning Pass a function, not a value
`toThrow` needs to call the code itself. Wrap the call in an arrow function - `xExpect(() => parse(x)).toThrow()`.
Writing `xExpect(parse(x))` throws *before* the matcher runs.
:::

### Any error

```ts
xExpect(() => { throw new Error('oops'); }).toThrow();
xExpect(() => 'ok').not.toThrow();
```

### By error type

```ts
xExpect(() => { throw new TypeError('invalid type'); }).toThrow(TypeError);
xExpect(() => { throw new Error('oops'); }).not.toThrow(SyntaxError);

class ValidationError extends Error {}
xExpect(() => { throw new ValidationError('invalid data'); }).toThrow(ValidationError);
```

### By message

```ts
xExpect(() => { throw new Error('invalid password'); }).toThrow('password');
xExpect(() => { throw new Error('File not found'); }).toThrow('not found');
```

### By pattern

```ts
xExpect(() => { throw new Error('Code: 404, Not Found'); }).toThrow(/Code: \d+/);
```

### By shape

```ts
// Plain thrown object
xExpect(() => {
    throw { code: 'AUTH_FAILED', message: 'Invalid credentials' };
}).toThrow({ code: 'AUTH_FAILED', message: 'Invalid credentials' });

// Error matched partially with an asymmetric matcher
xExpect(() => {
    throw new Error('Permission denied');
}).toThrow(xExpect.objectContaining({
    name: 'Error',
    message: 'Permission denied',
    stack: xExpect.any(String)
}));
```

## With Promises

Combine `toThrow` with the [`.rejects`](/guide/modifiers#rejects) modifier to assert on a rejected Promise.

```ts
await xExpect(Promise.reject(new Error('Failed'))).rejects.toThrow('Failed');
await xExpect(Promise.reject(new TypeError('Type error'))).rejects.toThrow(TypeError);
```

## Common patterns

```ts
test('validateEmail throws for invalid emails', () => {
    xExpect(() => validateEmail('')).toThrow('Email cannot be empty');
    xExpect(() => validateEmail('invalid')).toThrow('Invalid email format');
    xExpect(() => validateEmail('user@example.com')).not.toThrow();
});

test('database operations throw specific errors', () => {
    class DatabaseError extends Error {
        constructor(message: string, public code: string) {
            super(message);
            this.name = 'DatabaseError';
        }
    }

    const connect = (): never => {
        throw new DatabaseError('Connection failed', 'DB_CONN_ERROR');
    };

    xExpect(connect).toThrow(DatabaseError);
    xExpect(connect).toThrow('Connection failed');
    xExpect(connect).toThrow(xExpect.objectContaining({ code: 'DB_CONN_ERROR' }));
});
```

## See also

- [Modifiers](/guide/modifiers) - `.rejects` for async throwing
- [Asymmetric matchers](/guide/asymmetric)
- [Mocks & Spies](/matchers/mocks)
