# Function Matchers

Function matchers allow you to test function behavior, particularly for error handling and exceptions.

## toThrow

Checks if a function throws an error when executed. This matcher can verify that exceptions are properly thrown and that they match expected criteria.

```ts
xExpect(fn).toThrow(expected?)
```

The `expected` parameter is optional and versatile, allowing you to check different aspects of the thrown error.

::: info
:rocket: **Supports asymmetric matchers**
:::

### Parameters

- `expected`: (Optional) The expected error criteria, which can be:
  - Constructor function (e.g., `Error`, `TypeError`)
  - String substring that should be in the error message
  - RegExp pattern to match against the error message
  - Object to match with the thrown error
  - Asymmetric matcher

### Basic Usage

```ts
// Test that a function throws any error
xExpect(() => { throw new Error('oops') }).toThrow()
xExpect(() => { console.log('ok') }).not.toThrow()
```

### With Error Constructors

```ts
// Test for specific error types
xExpect(() => { throw new TypeError('invalid type') }).toThrow(TypeError)
xExpect(() => { throw new RangeError('out of bounds') }).toThrow(RangeError)
xExpect(() => { throw new Error('oops') }).not.toThrow(SyntaxError)

// With custom error classes
class ValidationError extends Error {}
xExpect(() => { throw new ValidationError('invalid data') }).toThrow(ValidationError)
```

### With String Messages

```ts
// Test for error message content
xExpect(() => { throw new Error('invalid password') }).toThrow('password')
xExpect(() => { throw new Error('File not found') }).toThrow('not found')
xExpect(() => { throw new Error('Connection failed') }).not.toThrow('success')
```

### With RegExp Patterns

```ts
// Test error message patterns
xExpect(() => { throw new Error('invalid email: user@example') }).toThrow(/invalid email/)
xExpect(() => { throw new Error('Code: 404, Not Found') }).toThrow(/Code: \d+/)
xExpect(() => { throw new Error('API Error: Rate limit exceeded') }).not.toThrow(/permission denied/i)
```

### With Objects

```ts
// Test for object properties
xExpect(() => { 
  throw { code: 'AUTH_FAILED', message: 'Invalid credentials' }
}).toThrow({ 
  code: 'AUTH_FAILED', 
  message: 'Invalid credentials' 
})

// Works with Error objects too
xExpect(() => { 
  const err = new Error('Permission denied')
  err.code = 403
  throw err
}).toThrow(xExpect.objectContaining({ 
  message: 'Permission denied',
  code: 403
}))

xExpect(() => {
    throw new Error('Permission denied');
}).toThrow({
    message: 'Permission denied',
    stack: xExpect.any(String),
    name: 'Error'
})
```

### With Asymmetric Matchers

```ts
xExpect(() => { 
  throw { 
    status: 404, 
    errors: ['Resource not found', 'Check the URL']
  }
})
  .toThrow(xExpect.objectContaining({ 
    status: xExpect.any(Number),
    errors: xExpect.arrayContaining(['Resource not found'])
  }))
```

## Usage with Promises

When testing async functions and promises, you can combine `toThrow` with the `rejects` modifier:

```ts
// Testing rejected promises
await xExpect(Promise.reject(new Error('Failed'))).rejects.toThrow('Failed')
await xExpect(Promise.reject(new TypeError('Type error'))).rejects.toThrow(TypeError)

// With async functions
await xExpect(async () => {
  throw new Error('Async error')
}).rejects.toThrow('Async error')
```

## Common Patterns and Best Practices

### Testing Error Boundaries

``` ts
test('component error boundary catches rendering errors', () => {
  const errorSpy = xJet.spyOn(console, 'error').mockImplementation(() => {})
  
  xExpect(() => {
    render(<BrokenComponent />)
  }).toThrow('Failed to render')
  
  errorSpy.mockRestore()
})
```

### Validating Input Parameters

``` ts
test('validateEmail throws for invalid emails', () => {
  xExpect(() => validateEmail('')).toThrow('Email cannot be empty')
  xExpect(() => validateEmail('invalid')).toThrow('Invalid email format')
  xExpect(() => validateEmail('user@example.com')).not.toThrow()
})
```

### Testing Error States in API Calls

``` ts
test('API client throws meaningful errors', async () => {
  // Mock failed network request
  fetchMock.mockRejectedValueOnce(new Error('Network failure'))
  
  await xExpect(api.getUser(123)).rejects.toThrow('Network failure')
  
  // Mock 404 response
  fetchMock.mockResponseOnce(JSON.stringify({ error: 'Not Found' }), { status: 404 })
  
  await xExpect(api.getUser(999)).rejects.toThrow(/not found/i)
})
```

### Testing Custom Error Classes

``` ts
test('database operations throw specific errors', () => {
  class DatabaseError extends Error {
    constructor(message: string, public code: string) {
      super(message)
      this.name = 'DatabaseError'
    }
  }
  
  const connectToDb = (config: unknown) => {
    throw new DatabaseError('Connection failed', 'DB_CONN_ERROR')
  }
  
  xExpect(() => connectToDb({})).toThrow(DatabaseError)
  xExpect(() => connectToDb({})).toThrow('Connection failed')
  xExpect(() => connectToDb({})).toThrow(xExpect.objectContaining({ 
    code: 'DB_CONN_ERROR' 
  }))
})
```

### Testing Error Chains

``` ts
test('processPayment forwards underlying errors', () => {
  // Mock payment processor that throws
  const paymentProcessor = {
    charge: () => { throw new Error('Insufficient funds') }
  }
  
  const processPayment = (amount: number) => {
    try {
      paymentProcessor.charge(amount)
    } catch (err) {
      throw new Error(`Payment failed: ${err.message}`)
    }
  }
  
  xExpect(() => processPayment(100)).toThrow('Payment failed: Insufficient funds')
})
```
