# Asymmetric Matchers

Asymmetric matchers verify that a value meets a *condition* instead of equalling an exact value. They are
indispensable when only part of a value matters, or when data is dynamic - timestamps, generated ids, or
floating-point results.

They are accessed off `xExpect` and dropped in wherever a concrete value would go.

| Matcher                       | Matches                                        |
|-------------------------------|------------------------------------------------|
| `xExpect.any(Ctor)`           | Any value produced by the constructor `Ctor`   |
| `xExpect.anything()`          | Any value except `null` and `undefined`        |
| `xExpect.closeTo(n, p?)`      | A number within precision `p` of `n`           |
| `xExpect.arrayOf(pattern)`    | An array whose every element matches `pattern` |
| `xExpect.arrayContaining(xs)` | An array containing all of `xs`, in any order  |
| `xExpect.objectContaining(o)` | An object with at least the properties of `o`  |
| `xExpect.stringContaining(s)` | A string containing the substring `s`          |
| `xExpect.stringMatching(re)`  | A string matching the `RegExp` `re`            |

## Basic usage

Drop an asymmetric matcher anywhere a value would normally go:

```ts
test('user data has expected structure', () => {
    const user = fetchUser(123);

    xExpect(user).toEqual({
        id: 123,
        name: xExpect.any(String),
        createdAt: xExpect.any(Date),
        status: 'active'
    });
});
```

## Where they can be used

They work in any matcher that compares values - equality, mock arguments, thrown errors, and array membership:

```ts
// Equality
xExpect({ name: 'Alice' }).toEqual({ name: xExpect.any(String) });

// Mock call arguments
xExpect(mockFunction).toHaveBeenCalledWith(xExpect.objectContaining({ id: 123 }));

// Thrown errors
xExpect(() => validateEmail('')).toThrow(xExpect.objectContaining({ code: 'VALIDATION_ERROR' }));

// Array membership
xExpect([ 'apple', 'banana' ]).toContainEqual(xExpect.stringMatching(/^a/));

// Partial object matching
xExpect(response).toMatchObject({ users: xExpect.arrayContaining([ { role: 'admin' } ]) });
```

::: tip
Each matcher page marks the matchers that accept asymmetric values with a **Supports asymmetric matchers** callout.
:::

## any

`xExpect.any(constructor)` - matches any value created by the given constructor, including custom classes.

```ts
test('value type checking', () => {
    xExpect({ name: 'Alice' }).toEqual({ name: xExpect.any(String) });
    xExpect(Math.round(2)).toEqual(xExpect.any(Number));

    class User {}
    xExpect(new User()).toEqual(xExpect.any(User));
});
```

## anything

`xExpect.anything()` - matches any value that is not `null` or `undefined`.

```ts
test('verifies value exists', () => {
    const response = { data: 'something', timestamp: 1700000000000 };

    xExpect(response).toEqual({
        data: xExpect.anything(),
        timestamp: xExpect.anything()
    });
});
```

## closeTo

`xExpect.closeTo(value, precision?)` - matches a number within a tolerance of the target, for use inside larger
structures. Use [`toBeCloseTo`](/matchers/numbers#tobecloseto) for a bare number.

```ts
test('approximate value inside an object', () => {
    const point = { x: 0.1 + 0.2, y: 1 };

    xExpect(point).toEqual({ x: xExpect.closeTo(0.3, 5), y: 1 });
});
```

## arrayOf

`xExpect.arrayOf(pattern)` - matches an array in which **every** element matches the pattern.

```ts
xExpect([ 'apple', 'banana', 'cherry' ]).toEqual(xExpect.arrayOf(xExpect.any(String)));
```

## arrayContaining

`xExpect.arrayContaining(items)` - matches an array that contains all the given items, in any order.

```ts
test('array includes required elements', () => {
    const fruits = [ 'apple', 'banana', 'orange', 'grape' ];
    xExpect(fruits).toEqual(xExpect.arrayContaining([ 'banana', 'apple' ]));
});
```

## objectContaining

`xExpect.objectContaining(object)` - matches an object that has at least the given properties with matching
values. Extra properties are ignored, and it nests.

```ts
test('object structure validation', () => {
    const user = {
        id: 1,
        name: 'John',
        preferences: { theme: 'dark', notifications: true }
    };

    xExpect(user).toEqual(xExpect.objectContaining({
        name: 'John',
        preferences: xExpect.objectContaining({ theme: 'dark' })
    }));
});
```

## stringContaining

`xExpect.stringContaining(substring)` - matches a string that contains the substring.

```ts
xExpect('Operation completed successfully').toEqual(xExpect.stringContaining('completed'));
```

## stringMatching

`xExpect.stringMatching(pattern)` - matches a string against a regular expression.

```ts
test('string format validation', () => {
    const user = { email: 'admin@company.org', role: 'ADMIN' };

    xExpect(user).toEqual({
        email: xExpect.stringMatching(/.+@company\.org$/),
        role: xExpect.stringMatching(/^[A-Z]+$/)
    });
});
```

## Negating with .not

`xExpect.not` negates any of the matchers above - the value passes when it does **not** match.

```ts
test('using negated matchers', () => {
    const data = { temperature: 25.2, status: 'warning', tags: [ 'important', 'urgent' ] };

    xExpect(data.temperature).toEqual(xExpect.not.closeTo(0, 1));
    xExpect(data.status).toEqual(xExpect.not.stringMatching(/^error/));
    xExpect(data.tags).toEqual(xExpect.not.arrayContaining([ 'low-priority' ]));
});
```

## See also

- [Equality matchers](/matchers/equality)
- [Objects & Arrays](/matchers/objects)
- [Modifiers](/guide/modifiers)
