# Equality Matchers

Equality matchers provide different ways to compare values in your tests, from strict equality to deep object comparison.

## toBe

Checks if the received value is strictly equal to the expected value using `Object.is()`.

```ts
xExpect(value).toBe(expected)
```

`toBe` is most appropriate when testing exact identity rather than structure.
::: info
:rocket: **Supports asymmetric matchers** - at the root level only
:::

```ts
// Primitives
xExpect(2 + 2).toBe(4)
xExpect('hello').toBe('hello')
xExpect(true).toBe(true)

// Same object reference
const obj = { a: 1 }
xExpect(obj).toBe(obj)

// With asymmetric matchers
xExpect('hello world').toBe(xExpect.stringContaining('hello'))
xExpect(42).toBe(xExpect.any(Number))

```

### Common Mistakes

```ts
// This fails because they're different object references
xExpect({ a: 1 }).toBe({ a: 1 })

// This fails because they're different array references
xExpect([1, 2, 3]).toBe([1, 2, 3])
```

If you want to compare value equality for objects or arrays, use `toEqual` instead.

### Choosing Between toBe and toEqual

- Use `toBe` when you need to ensure it's exactly the same instance (reference equality)
- Use `toEqual` when you care about value equivalence rather than identity

```ts
// Use toBe for primitives
xExpect(2 + 2).toBe(4)

// Use toEqual for objects/arrays with the same content
xExpect({ id: 1, name: 'Test' }).toEqual({ id: 1, name: 'Test' })
```

## toEqual

Performs a deep equality check between the received and expected values.

```ts
xExpect(value).toEqual(expected)
```

`toEqual` recursively compares all properties of objects and elements of arrays, making it perfect for data structure validation.

::: info
:rocket: **Supports asymmetric matchers** - at any level of nesting
:::

```ts
// Objects with the same properties
xExpect({ name: 'Alice', age: 30 }).toEqual({ name: 'Alice', age: 30 })

// Nested objects
xExpect({ user: { name: 'Bob', permissions: ['read', 'write'] } })
  .toEqual({ user: { name: 'Bob', permissions: ['read', 'write'] } })

// Arrays
xExpect([1, 2, 3]).toEqual([1, 2, 3])

// With asymmetric matchers
xExpect({ name: 'Alice', created: new Date() }).toEqual({
  name: 'Alice',
  created: xExpect.any(Date)
})

// Nested asymmetric matchers
xExpect({ 
  user: { 
    id: 123, 
    posts: [{ title: 'Hello' }, { title: 'World' }] 
  } 
}).toEqual({
  user: {
    id: xExpect.any(Number),
    posts: xExpect.arrayContaining([
      xExpect.objectContaining({ title: 'Hello' })
    ])
  }
})

```

## toBeNull

Checks if the received value is exactly `null`.

```ts
xExpect(value).toBeNull()
```

```ts
xExpect(null).toBeNull()
xExpect(undefined).not.toBeNull()
xExpect(0).not.toBeNull()
xExpect('').not.toBeNull()

```

## toBeUndefined

Checks if the received value is exactly `undefined`.

```ts
xExpect(value).toBeUndefined()
```

```ts
xExpect(undefined).toBeUndefined()
xExpect(void 0).toBeUndefined()
xExpect(null).not.toBeUndefined()
xExpect(0).not.toBeUndefined()
```

## toBeDefined

Checks if the received value is not `undefined`.

```ts
xExpect(null).toBeDefined()
xExpect(0).toBeDefined()
xExpect('').toBeDefined()
xExpect(false).toBeDefined()
xExpect(undefined).not.toBeDefined()

```

## toBeNaN

Checks if the received value is `NaN`.

```ts
xExpect(value).toBeNaN()
```

```ts
xExpect(NaN).toBeNaN()
xExpect(0/0).toBeNaN()
xExpect(parseInt('not a number')).toBeNaN()
xExpect(42).not.toBeNaN()
```

## toBeTruthy

Checks if the received value is truthy (evaluates to true in a boolean context).

```ts
xExpect(value).toBeTruthy()
```

```ts
xExpect(true).toBeTruthy()
xExpect(1).toBeTruthy()
xExpect('hello').toBeTruthy()
xExpect({}).toBeTruthy()
xExpect([]).toBeTruthy()

xExpect(false).not.toBeTruthy()
xExpect(0).not.toBeTruthy()
xExpect('').not.toBeTruthy()
xExpect(null).not.toBeTruthy()
xExpect(undefined).not.toBeTruthy()
```

## toBeFalsy

Checks if the received value is falsy (evaluates to false in a boolean context).

```ts
xExpect(false).toBeFalsy()
xExpect(0).toBeFalsy()
xExpect('').toBeFalsy()
xExpect(null).toBeFalsy()
xExpect(undefined).toBeFalsy()
xExpect(NaN).toBeFalsy()

xExpect(true).not.toBeFalsy()
xExpect(1).not.toBeFalsy()
xExpect('hello').not.toBeFalsy()
xExpect({}).not.toBeFalsy()
xExpect([]).not.toBeFalsy()

```
