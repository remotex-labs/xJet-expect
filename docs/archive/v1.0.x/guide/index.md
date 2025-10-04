---
outline: deep
---
# Guide

## Expect

When writing tests, xJet provides a powerful assertion mechanism through the `expect` function.
This function gives you access to various "matchers" that let you validate different conditions in your code.
With `expect`, you can:

- Compare values (`toBe`, `toEqual`)
- Check for truthiness (`toBeTruthy`, `toBeFalsy`)
- Verify numeric comparisons (`toBeGreaterThan`, `toBeLessThan`)
- Test for containment in arrays or strings (`toContain`)
- Validate object properties (`toHaveProperty`)
- Verify exceptions are thrown (`toThrow`)

These matchers make your tests more readable and provide helpful error messages when assertions fail, making it easier to debug your code.

### expect(`value`)

The `expect` function forms the foundation of test assertions. You'll typically pair `expect` with a "matcher" function to verify that values meet specific conditions.
For example, to test if a function returns the expected string:

```ts
test('serializes simple values', () => {
  expect(someFunction()).toBe('result');
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
expect(2 + 2).toBe(4);
expect('hello').toBe('hello');

// Object references must be identical for toBe
const obj = { a: 1 };
expect(obj).toBe(obj); // Passes - same reference
expect(obj).not.toBe({ a: 1 }); // Passes - different reference
```

### Deep Equality

``` ts
// Deep equality comparison (recursive value equality)
expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 });
expect([1, 2, { a: 3 }]).toEqual([1, 2, { a: 3 }]);

// Works with nested structures
expect({
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
expect(true).toBeTruthy();
expect(1).toBeTruthy();
expect('hello').toBeTruthy();

expect(false).toBeFalsy();
expect(0).toBeFalsy();
expect('').toBeFalsy();
expect(null).toBeFalsy();
expect(undefined).toBeFalsy();
```

### Presence Testing

``` ts
// Check for null/undefined
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('something').not.toBeNull();
expect(42).toBeDefined(); // opposite of toBeUndefined

// Check for NaN
expect(NaN).toBeNaN();
expect(1).not.toBeNaN();
```

## Modifiers

### .not

The modifier inverts the expectation, allowing you to assert that something is not true: `.not`

``` ts
expect(42).not.toBeNull();
expect('hello').not.toBe('world');
expect([1, 2, 3]).not.toContain(4);
```

### .resolves and .rejects

When working with Promises, use the and modifiers: `.resolves``.rejects`

``` ts
// Testing resolved promises
await expect(Promise.resolve('success')).resolves.toBe('success');
await expect(fetchData()).resolves.toHaveProperty('id');

// Testing rejected promises
await expect(Promise.reject(new Error('failed'))).rejects.toThrow('failed');
await expect(fetchInvalidData()).rejects.toThrow();
```

## Asymmetric Matchers

Asymmetric matchers provide more flexible matching options when exact values aren't known or needed:

``` ts
// Match any value of a specific type
expect({ id: 123, created: new Date() }).toEqual({
  id: expect.any(Number),
  created: expect.any(Date)
});

// Check if a string contains a substring
expect('Hello World').toEqual(expect.stringContaining('World'));

// Check if an array contains certain items (in any order)
expect(['apple', 'banana', 'orange']).toEqual(
  expect.arrayContaining(['banana', 'apple'])
);

// Check if an object has at least the specified properties
expect({ id: 1, name: 'John', age: 30 }).toEqual(
  expect.objectContaining({ id: 1, name: 'John' })
);
```

## Best Practices

### Be Specific

Choose the most specific matcher for your assertions:

``` ts
// Good - specific matcher
expect(value).toBeGreaterThan(0);

// Less clear - generic matcher
expect(value > 0).toBe(true);
```

### Test Behavior, Not Implementation

Focus on testing what your code does, not how it does it:

``` ts
// Good - tests behavior
expect(calculateTotal([10, 20, 30])).toBe(60);

// Avoid - tests implementation details
expect(calculateTotal.calls).toHaveLength(1);
```

### Clear Failure Messages

Write assertions that provide clear failure messages:

``` ts
// With descriptive test names
test('returns 200 status code for valid requests', () => {
  expect(response.status).toBe(200);
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
  expect(user.username).toBe('newname');
});

test('can update email', () => {
  user.setEmail('new@example.com');
  expect(user.email).toBe('new@example.com');
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

The `expect` function is the cornerstone of effective testing with xJet.
By combining it with the right matchers and following best practices, you can write tests that are:

- Easy to read and understand
- Focused on behavior
- Resilient to implementation changes
- Helpful when they fail

Explore the specific matcher categories for more detailed examples and advanced usage patterns.
