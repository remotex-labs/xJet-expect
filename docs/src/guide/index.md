---
outline: deep
---
# Guide

## Expect

When writing tests, xJet provides a powerful assertion mechanism through the `xExpect` function.
This function gives you access to various "matchers" that let you validate different conditions in your code.
With `xExpect`, you can:

- Compare values (`toBe`, `toEqual`)
- Check for truthiness (`toBeTruthy`, `toBeFalsy`)
- Verify numeric comparisons (`toBeGreaterThan`, `toBeLessThan`)
- Test for containment in arrays or strings (`toContain`)
- Validate object properties (`toHaveProperty`)
- Verify exceptions are thrown (`toThrow`)

These matchers make your tests more readable and provide helpful error messages when assertions fail, making it easier to debug your code.

### xExpect(`value`)

The `xExpect` function forms the foundation of test assertions.
You'll typically pair `xExpect` with a "matcher" function to verify that values meet specific conditions.
For example, to test if a function returns the expected string:

```ts
test('serializes simple values', () => {
  xExpect(someFunction()).toBe('result');
});
```

### Matcher Groups

xJet provides several categories of matchers for different testing needs:

- **Equality Matchers** - Compare values with different levels of strictness
- **Number Matchers** - Validate numeric comparisons and ranges
- **String Matchers** - Test string content and patterns
- **Object Matchers** - Verify object properties and structure
- **Function Matchers** - Test function behavior and exceptions
- **Mock Matchers** - Validate mock function calls and return values

## Basic Assertions

Here are some common assertions you'll use frequently in your tests:

### Strict Equality

```ts
// Check for exact equality (same value and type)
xExpect(2 + 2).toBe(4);
xExpect('hello').toBe('hello');

// Object references must be identical for toBe
const obj = { a: 1 };
xExpect(obj).toBe(obj); // Passes - same reference
xExpect(obj).not.toBe({ a: 1 }); // Passes - different reference
```

### Deep Equality

``` ts
// Deep equality comparison (recursive value equality)
xExpect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 });
xExpect([1, 2, { a: 3 }]).toEqual([1, 2, { a: 3 }]);

// Works with nested structures
xExpect({
  user: {
    profile: { name: 'Alice' },
    permissions: ['read', 'write']
  }
}).toEqual({
  user: {
    profile: { name: 'Alice' },
    permissions: ['read', 'write']
  }
});
```

### Truthiness

``` ts
// Check for truthy/falsy values
xExpect(true).toBeTruthy();
xExpect(1).toBeTruthy();
xExpect('hello').toBeTruthy();

xExpect(false).toBeFalsy();
xExpect(0).toBeFalsy();
xExpect('').toBeFalsy();
xExpect(null).toBeFalsy();
xExpect(undefined).toBeFalsy();
```

### Presence Testing

``` ts
// Check for null/undefined
xExpect(null).toBeNull();
xExpect(undefined).toBeUndefined();
xExpect('something').not.toBeNull();
xExpect(42).toBeDefined(); // opposite of toBeUndefined

// Check for NaN
xExpect(NaN).toBeNaN();
xExpect(1).not.toBeNaN();
```

## Modifiers

### .not

The modifier inverts the expectation, allowing you to assert that something is not true: `.not`

``` ts
xExpect(42).not.toBeNull();
xExpect('hello').not.toBe('world');
xExpect([1, 2, 3]).not.toContain(4);
```

### .resolves and .rejects

When working with Promises, use the and modifiers: `.resolves``.rejects`

``` ts
// Testing resolved promises
await xExpect(Promise.resolve('success')).resolves.toBe('success');
await xExpect(fetchData()).resolves.toHaveProperty('id');

// Testing rejected promises
await xExpect(Promise.reject(new Error('failed'))).rejects.toThrow('failed');
await xExpect(fetchInvalidData()).rejects.toThrow();
```

## Asymmetric Matchers

Asymmetric matchers provide more flexible matching options when exact values aren't known or needed:

``` ts
// Match any value of a specific type
xExpect({ id: 123, created: new Date() }).toEqual({
  id: xExpect.any(Number),
  created: xExpect.any(Date)
});

// Check if a string contains a substring
xExpect('Hello World').toEqual(xExpect.stringContaining('World'));

// Check if an array contains certain items (in any order)
xExpect(['apple', 'banana', 'orange']).toEqual(
  xExpect.arrayContaining(['banana', 'apple'])
);

// Check if an object has at least the specified properties
xExpect({ id: 1, name: 'John', age: 30 }).toEqual(
  xExpect.objectContaining({ id: 1, name: 'John' })
);
```

## Best Practices

### Be Specific

Choose the most specific matcher for your assertions:

``` ts
// Good - specific matcher
xExpect(value).toBeGreaterThan(0);

// Less clear - generic matcher
xExpect(value > 0).toBe(true);
```

### Test Behavior, Not Implementation

Focus on testing what your code does, not how it does it:

``` ts
// Good - tests behavior
xExpect(calculateTotal([10, 20, 30])).toBe(60);

// Avoid - tests implementation details
xExpect(calculateTotal.calls).toHaveLength(1);
```

### Clear Failure Messages

Write assertions that provide clear failure messages:

``` ts
// With descriptive test names
test('returns 200 status code for valid requests', () => {
  xExpect(response.status).toBe(200);
});
```

### Keep Tests Independent

Each test should be independent and not rely on state from other tests:

``` ts
// Good - setup in each test
beforeEach(() => {
  user = createTestUser();
});

test('can update username', () => {
  user.setUsername('newname');
  xExpect(user.username).toBe('newname');
});

test('can update email', () => {
  user.setEmail('new@example.com');
  xExpect(user.email).toBe('new@example.com');
});
```

## Debugging Failed Tests

When a test fails, xJet provides detailed error messages to help identify the issue:

```bash
Expected: 42
Received: 41

Expected: Object {
- "count": 2,
+ "count": 3,
  "name": "test"
}
```

These detailed diffs make it easier to spot differences between expected and actual values.

## Conclusion

The `xExpect` function is the cornerstone of effective testing with xJet.
By combining it with the right matchers and following best practices, you can write tests that are:

- Easy to read and understand
- Focused on behavior
- Resilient to implementation changes
- Helpful when they fail

Explore the specific matcher categories for more detailed examples and advanced usage patterns.
