# String Matchers

String matchers assert on string content and length. `toHaveLength` also works on arrays and any value with a
numeric `length`.

| Matcher        | Passes when                                  |
|----------------|----------------------------------------------|
| `toHaveLength` | The value's `length` equals the expected one |
| `toMatch`      | Contains a substring or matches a `RegExp`   |

## toHaveLength

Checks that a value has the expected `length`.

```ts
xExpect(value).toHaveLength(length);
```

- `length` - the expected length, as a `number` or `bigint`.

```ts
// Strings
xExpect('hello').toHaveLength(5);
xExpect('').toHaveLength(0);
xExpect('hi').not.toHaveLength(3);

// Arrays
xExpect([ 'a', 'b', 'c' ]).toHaveLength(3);
xExpect(new Array(10)).toHaveLength(10);

// Any value with a numeric length
xExpect({ length: 5 }).toHaveLength(5);
```

## toMatch

Checks that a string contains a substring or matches a regular expression.

```ts
xExpect(value).toMatch(expected);
```

- `expected` - a substring or a `RegExp` to match against.

### With a substring

```ts
xExpect('hello world').toMatch('world');
xExpect('hello world').not.toMatch('universe');

// Case-sensitive
xExpect('Hello World').not.toMatch('hello');
```

### With a regular expression

```ts
xExpect('hello world').toMatch(/world/);
xExpect('Hello World').toMatch(/hello/i);
xExpect('abc123').toMatch(/^[a-z]+\d+$/);
xExpect('user@example.com').toMatch(/^[\w.-]+@[\w.-]+\.\w+$/);
xExpect('hello world').not.toMatch(/^goodbye/);
```

::: tip Substrings vs whole-string matches
`toMatch` succeeds on a *partial* match. Anchor the pattern with `^` and `$` when the whole string must conform -
for example when validating a format rather than detecting a fragment.
:::

## Common patterns

```ts
test('username has a valid length', () => {
    const username = 'johndoe';

    xExpect(username).toHaveLength(7);
    xExpect(username.length).toBeGreaterThanOrEqual(3);
    xExpect(username.length).toBeLessThanOrEqual(20);
});

test('validates email format', () => {
    xExpect('user@example.com').toMatch(/^[\w.-]+@[\w.-]+\.\w+$/);
});
```

## See also

- [Numbers](/matchers/numbers) - comparing `string.length`
- [Asymmetric matchers](/guide/asymmetric) - `xExpect.stringMatching()` and `xExpect.stringContaining()`
- [Objects & Arrays](/matchers/objects) - `toContain` for substrings and array membership
