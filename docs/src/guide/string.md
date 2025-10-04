# String Matchers

String matchers help you test string values, allowing you to check string content, patterns, and properties.

## toHaveLength

Checks if a string (or any object with a `length` property) has the expected length.

```ts
xExpect(value).toHaveLength(length)
```

*Parameters:*

- `length`: The expected length as a number or bigint

```ts
// String length
xExpect('hello').toHaveLength(5)  // Passes
xExpect('').toHaveLength(0)  // Passes
xExpect('hi').not.toHaveLength(3)  // Passes

// Works with arrays too
xExpect(['a', 'b', 'c']).toHaveLength(3)  // Passes
xExpect(new Array(10)).toHaveLength(10)  // Passes

// Works with any object having a numeric length property
xExpect({ length: 5 }).toHaveLength(5)  // Passes
```

## toMatch

Checks if a string matches a substring or regular expression pattern.

```ts
xExpect(value).toMatch(expected)
```

### Parameters

- `expected`: A string substring or RegExp pattern to match against

### Examples

#### With String Substring

```ts
// Basic substring matching
xExpect('hello world').toMatch('world')  // Passes
xExpect('hello world').toMatch('hello')  // Passes
xExpect('hello world').not.toMatch('universe')  // Passes

// Case-sensitive by default
xExpect('Hello World').not.toMatch('hello')  // Passes
```

#### With Regular Expressions

```ts
// Basic regex matching
xExpect('hello world').toMatch(/world/)  // Passes

// Case-insensitive matching
xExpect('Hello World').toMatch(/hello/i)  // Passes

// Pattern matching
xExpect('abc123').toMatch(/^[a-z]+\d+$/)  // Passes
xExpect('user@example.com').toMatch(/^[\w.-]+@[\w.-]+\.\w+$/)  // Passes

// Negative matching
xExpect('hello world').not.toMatch(/^goodbye/)  // Passes
```

## Common Testing Patterns

### Format Validation

```ts
test('validates email format', () => {
  const email = 'user@example.com'
  xExpect(email).toMatch(/^[\w.-]+@[\w.-]+\.\w+$/)
})
```

### Content Verification

```ts
test('error message contains relevant information', () => {
  const error = getErrorMessage()
  xExpect(error).toMatch('invalid input')
  xExpect(error).toMatch(/at line \d+/)
})
```

### Length Constraints

```ts
test('username has valid length', () => {
  const username = 'johndoe'
  xExpect(username).toHaveLength(7)
  // Alternative approach using comparison
  xExpect(username.length).toBeGreaterThanOrEqual(3)
  xExpect(username.length).toBeLessThanOrEqual(20)
})
```
