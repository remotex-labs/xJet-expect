# Object & Array Matchers

These matchers inspect the properties, type, and structure of objects and arrays.

| Matcher          | Passes when                                           |
|------------------|-------------------------------------------------------|
| `toHaveProperty` | The object has a value at the given path              |
| `toBeInstanceOf` | The value is an instance of the constructor           |
| `toContain`      | An array includes an element, or a string a substring |
| `toContainEqual` | An array includes a deeply-equal element              |
| `toMatchObject`  | The object matches a subset of expected properties    |

## toHaveProperty

Checks that an object has a property at the given path, and optionally that the value there matches.

```ts
xExpect(object).toHaveProperty(path, value?);
```

::: tip Supports asymmetric matchers
The optional `value` accepts [asymmetric matchers](/guide/asymmetric).
:::

- `path` - a dot-notation string, or an array of keys, describing the property path.
- `value` *(optional)* - the expected value at that path.

```ts
// Basic checks
xExpect({ name: 'John' }).toHaveProperty('name');
xExpect({ user: { id: 123 } }).toHaveProperty('user.id');

// Indexing into arrays
xExpect({ users: [ 'John', 'Jane' ] }).toHaveProperty('users.0', 'John');
xExpect({ data: [ { id: 1 } ] }).toHaveProperty([ 'data', 0, 'id' ], 1);

// With expected values
xExpect({ settings: { theme: 'dark' } }).toHaveProperty('settings.theme', 'dark');

// Negated
xExpect({ name: 'John' }).not.toHaveProperty('age');
```

::: info Dot notation vs array path
Dot notation and an array of keys are equivalent. Use the array form when a key itself contains a dot.

```ts
xExpect(obj).toHaveProperty('user.profile.name');
xExpect(obj).toHaveProperty([ 'user', 'profile', 'name' ]);
xExpect({ 'user.name': 'John' }).toHaveProperty([ 'user.name' ]);
```

:::

## toBeInstanceOf

Checks that a value is an instance of a class or constructor, honoring the prototype chain.

```ts
xExpect(value).toBeInstanceOf(constructor);
```

```ts
// Built-in classes
xExpect(new Date()).toBeInstanceOf(Date);
xExpect([ 1, 2, 3 ]).toBeInstanceOf(Array);
xExpect(new Map()).toBeInstanceOf(Map);
xExpect(/abc/).toBeInstanceOf(RegExp);

// Custom classes and inheritance
class User {}
class Admin extends User {}

xExpect(new Admin()).toBeInstanceOf(User);  // walks the prototype chain
xExpect(new Admin()).toBeInstanceOf(Admin);
xExpect({}).not.toBeInstanceOf(Array);
```

## toContain

Checks that an array includes an element, or that a string includes a substring.

```ts
xExpect(arrayOrString).toContain(value);
```

::: warning Reference equality for objects
With arrays of objects, `toContain` matches by **reference**, not structure. Use
[`toContainEqual`](#tocontainequal) for deep equality.

```ts
xExpect([ { a: 1 } ]).toContain({ a: 1 });      // fails - different reference
xExpect([ { a: 1 } ]).toContainEqual({ a: 1 }); // passes
```

:::

```ts
// Arrays of primitives
xExpect([ 1, 2, 3 ]).toContain(2);
xExpect([ 'apple', 'banana' ]).toContain('banana');

// Same reference matches
const obj = { id: 1 };
xExpect([ obj, { id: 2 } ]).toContain(obj);

// Strings (substring)
xExpect('hello world').toContain('world');
xExpect('Hello World').not.toContain('hello'); // case-sensitive
```

## toContainEqual

Checks that an array contains an element that is *deeply equal* to the expected value.

```ts
xExpect(array).toContainEqual(value);
```

::: tip Supports asymmetric matchers
`value` accepts [asymmetric matchers](/guide/asymmetric).
:::

```ts
// Deep equality
xExpect([ { a: 1 }, { b: 2 } ]).toContainEqual({ a: 1 });
xExpect([ [ 1, 2 ], [ 3, 4 ] ]).toContainEqual([ 1, 2 ]);

// With asymmetric matchers
xExpect([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
]).toContainEqual(xExpect.objectContaining({ name: 'John' }));
```

## toMatchObject

Checks that an object matches a subset of expected properties, recursively. Extra properties on the received
object are ignored.

```ts
xExpect(object).toMatchObject(expected);
```

::: tip Supports asymmetric matchers
`expected` and its nested values accept [asymmetric matchers](/guide/asymmetric).
:::

```ts
// Partial match
xExpect({ name: 'John', age: 30 }).toMatchObject({ name: 'John' });

// Nested objects
xExpect({
    user: { name: 'John', profile: { role: 'admin', active: true } }
}).toMatchObject({
    user: { name: 'John', profile: { role: 'admin' } }
});

// With asymmetric matchers
xExpect({
    id: 123,
    user: { name: 'John', created: new Date('2023-01-01') }
}).toMatchObject({
    user: { name: xExpect.stringContaining('Jo'), created: xExpect.any(Date) }
});
```

::: info toMatchObject vs toEqual
`toMatchObject` ignores properties the expected object doesn't mention, so it's right for asserting a *subset*.
Use [`toEqual`](/matchers/equality#toequal) when every property must match exactly.

```ts
xExpect({ name: 'John', extra: true }).toMatchObject({ name: 'John' }); // passes
xExpect({ name: 'John' }).not.toMatchObject({ name: 'John', age: 30 }); // missing age
```

:::

## Common patterns

```ts
test('API returns the correct user data', async () => {
    const response = await fetchUser(123);

    xExpect(response).toMatchObject({
        id: 123,
        name: xExpect.any(String),
        email: xExpect.stringMatching(/^.+@.+\..+$/),
        created: xExpect.any(Date)
    });
});

test('config has the required properties', () => {
    const config = loadConfig();

    xExpect(config).toHaveProperty('api.url');
    xExpect(config).toHaveProperty('api.timeout', 5000);
    xExpect(config).toHaveProperty('debug', false);
});
```

## See also

- [Equality matchers](/matchers/equality)
- [Asymmetric matchers](/guide/asymmetric)
- [Strings](/matchers/strings) - `toContain` for substrings
