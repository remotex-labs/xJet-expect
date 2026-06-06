# Equality Matchers

Equality matchers compare values - from strict identity, through deep structural equality, to the common
presence and truthiness checks.

| Matcher         | Passes when                   |
|-----------------|-------------------------------|
| `toBe`          | Strict identity (`Object.is`) |
| `toEqual`       | Deep structural equality      |
| `toBeNull`      | Value is exactly `null`       |
| `toBeUndefined` | Value is exactly `undefined`  |
| `toBeDefined`   | Value is not `undefined`      |
| `toBeNaN`       | Value is `NaN`                |
| `toBeTruthy`    | Value is truthy               |
| `toBeFalsy`     | Value is falsy                |

## toBe

Checks strict equality with `Object.is()` - right for primitives and reference identity.

```ts
xExpect(value).toBe(expected);
```

::: tip Supports asymmetric matchers
Accepts [asymmetric matchers](/guide/asymmetric), but only at the **root level** - `toBe` does not recurse into
nested values.
:::

```ts
// Primitives
xExpect(2 + 2).toBe(4);
xExpect('hello').toBe('hello');
xExpect(true).toBe(true);

// Same object reference
const obj = { a: 1 };
xExpect(obj).toBe(obj);

// Asymmetric matchers at the root
xExpect(42).toBe(xExpect.any(Number));
```

::: warning References, not structure
`toBe` compares identity. Two objects or arrays with identical contents are still different instances and will
fail - use `toEqual` for value equality.

```ts
xExpect({ a: 1 }).toBe({ a: 1 });       // fails
xExpect([ 1, 2, 3 ]).toBe([ 1, 2, 3 ]); // fails
```

:::

## toEqual

Performs a deep, recursive equality check across object properties and array elements.

```ts
xExpect(value).toEqual(expected);
```

::: tip Supports asymmetric matchers
Accepts [asymmetric matchers](/guide/asymmetric) at **any** level of nesting.
:::

```ts
// Same properties
xExpect({ name: 'Alice', age: 30 }).toEqual({ name: 'Alice', age: 30 });

// Nested objects
xExpect({ user: { name: 'Bob', permissions: [ 'read', 'write' ] } })
    .toEqual({ user: { name: 'Bob', permissions: [ 'read', 'write' ] } });

// Nested asymmetric matchers
xExpect({
    user: { id: 123, posts: [ { title: 'Hello' }, { title: 'World' } ] }
}).toEqual({
    user: {
        id: xExpect.any(Number),
        posts: xExpect.arrayContaining([ xExpect.objectContaining({ title: 'Hello' }) ])
    }
});
```

## toBeNull

Checks that the value is exactly `null`.

```ts
xExpect(null).toBeNull();
xExpect(undefined).not.toBeNull();
xExpect(0).not.toBeNull();
```

## toBeUndefined

Checks that the value is exactly `undefined`.

```ts
xExpect(undefined).toBeUndefined();
xExpect(void 0).toBeUndefined();
xExpect(null).not.toBeUndefined();
```

## toBeDefined

Checks that the value is not `undefined` - the inverse of `toBeUndefined`.

```ts
xExpect(null).toBeDefined();
xExpect(0).toBeDefined();
xExpect(false).toBeDefined();
xExpect(undefined).not.toBeDefined();
```

## toBeNaN

Checks that the value is `NaN`.

```ts
xExpect(NaN).toBeNaN();
xExpect(0 / 0).toBeNaN();
xExpect(parseInt('not a number')).toBeNaN();
xExpect(42).not.toBeNaN();
```

## toBeTruthy

Checks that the value is truthy in a boolean context.

```ts
xExpect(true).toBeTruthy();
xExpect(1).toBeTruthy();
xExpect('hello').toBeTruthy();
xExpect({}).toBeTruthy();
xExpect([]).toBeTruthy();

xExpect(0).not.toBeTruthy();
xExpect('').not.toBeTruthy();
xExpect(null).not.toBeTruthy();
```

## toBeFalsy

Checks that the value is falsy in a boolean context.

```ts
xExpect(false).toBeFalsy();
xExpect(0).toBeFalsy();
xExpect('').toBeFalsy();
xExpect(null).toBeFalsy();
xExpect(undefined).toBeFalsy();
xExpect(NaN).toBeFalsy();

xExpect(1).not.toBeFalsy();
xExpect('hello').not.toBeFalsy();
xExpect({}).not.toBeFalsy();
```

::: info toBe vs toEqual
Use `toBe` for primitives and reference identity; use `toEqual` whenever you care about value equivalence. The
quickest way to a confusing failure is calling `toBe` on two structurally-equal objects.
:::

## See also

- [Objects & Arrays](/matchers/objects) - partial matching with `toMatchObject`
- [Asymmetric matchers](/guide/asymmetric)
- [Numbers](/matchers/numbers)
