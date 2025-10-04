# Mock Matchers

Mock matchers help you test the behavior of mock functions by verifying they were called with specific arguments, returned expected values, and more.

## toHaveBeenCalled

Verifies that a mock function has been called at least once.

```ts
xExpect(mockFn).toHaveBeenCalled()
```

```ts
// Creating a mock function
const mockFn = xJet.fn()

// After calling the mock
mockFn()
xExpect(mockFn).toHaveBeenCalled() // Passes

// When the mock hasn't been called
const unusedMock = xJet.fn()
xExpect(unusedMock).not.toHaveBeenCalled() // Passes
```

## toHaveBeenCalledTimes

Verifies that a mock function has been called an exact number of times.

```ts
xExpect(mockFn).toHaveBeenCalledTimes(expectedCount)
```

*Parameters:*

- `expectedCount`: The exact number of times the mock should have been called

```ts
const mockFn = xJet.fn()

// No calls
xExpect(mockFn).toHaveBeenCalledTimes(0) // Passes

// After multiple calls
mockFn()
mockFn()
mockFn()
xExpect(mockFn).toHaveBeenCalledTimes(3) // Passes
xExpect(mockFn).not.toHaveBeenCalledTimes(2) // Passes
```

## toHaveBeenCalledWith

Verifies that a mock function has been called with specified arguments at least once.

```ts
xExpect(mockFn).toHaveBeenCalledWith(...expectedArgs)
```

::: info
:rocket: **Supports asymmetric matchers**
:::

*Parameters:*

- `...expectedArgs`: The expected arguments that the mock function should have been called with

```ts
const mockFn = xJet.fn()

// Basic usage
mockFn('hello', 123)
xExpect(mockFn).toHaveBeenCalledWith('hello', 123) // Passes

// Multiple calls with different arguments
mockFn('first call')
mockFn('second call')
xExpect(mockFn).toHaveBeenCalledWith('first call') // Passes
xExpect(mockFn).toHaveBeenCalledWith('second call') // Passes
xExpect(mockFn).not.toHaveBeenCalledWith('never called') // Passes

// With objects
mockFn({ name: 'John', age: 30 })
xExpect(mockFn).toHaveBeenCalledWith({ name: 'John', age: 30 }) // Passes

// With asymmetric matchers
mockFn('hello world', { id: 123, data: [1, 2, 3] })
xExpect(mockFn).toHaveBeenCalledWith(
  xExpect.stringContaining('hello'),
  xExpect.objectContaining({ id: 123 })
) // Passes
```

## toHaveBeenLastCalledWith

Verifies that the last call to a mock function was with specified arguments.

```ts
xExpect(mockFn).toHaveBeenLastCalledWith(...expectedArgs)
```

::: info
:rocket: **Supports asymmetric matchers**
:::

*Parameters:*

- `...expectedArgs`: The expected arguments of the last call to the mock function

```ts
const mockFn = xJet.fn()

// Multiple calls with different arguments
mockFn('first call')
mockFn('second call')
mockFn('last call')

xExpect(mockFn).toHaveBeenLastCalledWith('last call') // Passes
xExpect(mockFn).not.toHaveBeenLastCalledWith('first call') // Passes

// With asymmetric matchers
mockFn({ type: 'final', id: 42 })
xExpect(mockFn).toHaveBeenLastCalledWith(
  xExpect.objectContaining({ type: 'final' })
) // Passes
```

## toHaveBeenNthCalledWith

Verifies that the nth call to a mock function was with specified arguments.

```ts
xExpect(mockFn).toHaveBeenNthCalledWith(n, ...expectedArgs)
```

::: info
:rocket: **Supports asymmetric matchers**
:::

*Parameters:*

- `n`: The call number to check (1-based index)
- `...expectedArgs`: The expected arguments of the nth call

```ts
const mockFn = xJet.fn()

// Series of calls with different arguments
mockFn('first')
mockFn('second')
mockFn('third')

xExpect(mockFn).toHaveBeenNthCalledWith(1, 'first') // Passes
xExpect(mockFn).toHaveBeenNthCalledWith(2, 'second') // Passes
xExpect(mockFn).toHaveBeenNthCalledWith(3, 'third') // Passes
xExpect(mockFn).not.toHaveBeenNthCalledWith(2, 'first') // Passes

// With complex arguments and asymmetric matchers
mockFn(1, { a: 'one' })
mockFn(2, { a: 'two' })
xExpect(mockFn).toHaveBeenNthCalledWith(
  5, 
  2, 
  xExpect.objectContaining({ a: 'two' })
) // Passes
```

## toHaveReturned

Verifies that a mock function successfully returned at least once (did not throw).

```ts
xExpect(mockFn).toHaveReturned()
```

```ts
// Mock that returns normally
const successMock = xJet.fn(() => true)
successMock()
xExpect(successMock).toHaveReturned() // Passes

// Mock that throws
const failMock = xJet.fn(() => { throw new Error('Failed') })
try {
  failMock()
} catch (e) {
  // Ignore error
}
xExpect(failMock).not.toHaveReturned() // Passes

// Mixed behavior
const mixedMock = xJet.fn(x => {
  if (x < 0) throw new Error('Negative')
  return x * 2
})

try { mixedMock(-1) } catch (e) { /* Ignore */ }
mixedMock(5)

xExpect(mixedMock).toHaveReturned() // Passes - returned at least once
```

## toHaveReturnedTimes

Verifies that a mock function successfully returned exactly n times.

```ts
xExpect(mockFn).toHaveReturnedTimes(expectedCount)
```

*Parameters:*

- `expectedCount`: The exact number of times the mock should have returned

```ts
const mockFn = xJet.fn(x => x * 2)

mockFn(1)
mockFn(2)
mockFn(3)

xExpect(mockFn).toHaveReturnedTimes(3) // Passes

// With some errors
const mixedMock = xJet.fn(x => {
  if (x < 0) throw new Error('Negative')
  return x * 2
})

mixedMock(1)
try { mixedMock(-1) } catch (e) { /* Ignore */ }
mixedMock(2)

xExpect(mixedMock).toHaveReturnedTimes(2) // Passes - only counts successful returns
```

## toHaveLastReturnedWith

Verifies that the last return value of a mock function matches the expected value.

```ts
xExpect(mockFn).toHaveLastReturnedWith(expectedValue)
```

::: info
:rocket: **Supports asymmetric matchers**
:::

*Parameters:*

- `expectedValue`: The value that should match the last return of the mock function

```ts
const mockFn = xJet.fn()
mockFn.mockReturnValueOnce('first result')
mockFn.mockReturnValueOnce('second result')
mockFn.mockReturnValue('default result')

mockFn() // Returns 'first result'
mockFn() // Returns 'second result'
mockFn() // Returns 'default result'

xExpect(mockFn).toHaveLastReturnedWith('default result') // Passes
xExpect(mockFn).not.toHaveLastReturnedWith('second result') // Passes

// With asymmetric matchers
const dataMock = xJet.fn().mockReturnValue({ id: 42, timestamp: Date.now() })
dataMock()
xExpect(dataMock).toHaveLastReturnedWith(
  xExpect.objectContaining({ id: 42 })
) // Passes
```

## toHaveNthReturnedWith

Verifies that the nth return value of a mock function matches the expected value.

```ts
xExpect(mockFn).toHaveNthReturnedWith(n, expectedValue)
```

::: info
:rocket: **Supports asymmetric matchers**
:::

*Parameters:*

- `n`: The call number to check (1-based index)
- `expectedValue`: The value that should match the nth return of the mock function

```ts
const mockFn = xJet.fn()
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second')
  .mockReturnValueOnce('third')

mockFn() // Returns 'first'
mockFn() // Returns 'second'
mockFn() // Returns 'third'

xExpect(mockFn).toHaveNthReturnedWith(1, 'first') // Passes
xExpect(mockFn).toHaveNthReturnedWith(2, 'second') // Passes
xExpect(mockFn).toHaveNthReturnedWith(3, 'third') // Passes
xExpect(mockFn).not.toHaveNthReturnedWith(2, 'third') // Passes

// With asymmetric matchers
const complexMock = xJet.fn()
  .mockReturnValueOnce({ type: 'user', data: { id: 1 } })
  .mockReturnValueOnce({ type: 'post', data: { id: 2 } })

complexMock()
complexMock()

xExpect(complexMock).toHaveNthReturnedWith(
  1, 
  xExpect.objectContaining({ type: 'user' })
) // Passes
```

## Common Testing Patterns

### Testing Callback Arguments

```ts
test('callback is called with correct arguments', () => {
  const mockCallback = xJet.fn()
  
  // Function that accepts a callback
  function processData(data, callback) {
    // Do something with data
    callback(data.id, data.value)
  }
  
  processData({ id: 123, value: 'test' }, mockCallback)
  
  xExpect(mockCallback).toHaveBeenCalledWith(123, 'test')
})
```

### Testing API Requests

```ts
test('API endpoint is called with correct parameters', async () => {
  // Mock the fetch function
  global.fetch = xJet.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true })
  })
  
  // Function that makes API call
  await fetchUserData(42, 'full')
  
  // Verify the API was called correctly
  xExpect(fetch).toHaveBeenCalledWith(
    'https://api.example.com/users/42?profile=full',
    xExpect.objectContaining({
      method: 'GET',
      headers: xExpect.objectContaining({
        'Content-Type': 'application/json'
      })
    })
  )
})
```

### Testing Call Order

```ts
test('operations are performed in the correct sequence', () => {
  const logger = xJet.fn()
  
  function performOperations() {
    logger('Starting')
    // Do something
    logger('Processing')
    // Do something else
    logger('Completed')
  }
  
  performOperations()
  
  xExpect(logger).toHaveBeenNthCalledWith(1, 'Starting')
  xExpect(logger).toHaveBeenNthCalledWith(2, 'Processing')
  xExpect(logger).toHaveBeenNthCalledWith(3, 'Completed')
  xExpect(logger).toHaveBeenCalledTimes(3)
})
```

### Testing Conditional Logic

```ts
test('conditional function calls', () => {
  const mockFn = xJet.fn()
  
  function processValue(value) {
    if (value > 0) {
      mockFn(`Positive: ${value}`)
    } else if (value < 0) {
      mockFn(`Negative: ${value}`)
    } else {
      mockFn('Zero')
    }
  }
  
  processValue(5)
  processValue(-3)
  processValue(0)
  
  xExpect(mockFn).toHaveBeenCalledWith('Positive: 5')
  xExpect(mockFn).toHaveBeenCalledWith('Negative: -3')
  xExpect(mockFn).toHaveBeenCalledWith('Zero')
  xExpect(mockFn).toHaveBeenCalledTimes(3)
})
```

### Testing Return Values

```ts
test('function returns expected values', () => {
  const transformData = xJet.fn()
    .mockReturnValueOnce({ transformed: true, id: 1 })
    .mockReturnValueOnce({ transformed: true, id: 2 })
  
  const result1 = transformData({ id: 1 })
  const result2 = transformData({ id: 2 })
  
  xExpect(transformData).toHaveNthReturnedWith(1, { transformed: true, id: 1 })
  xExpect(transformData).toHaveLastReturnedWith({ transformed: true, id: 2 })
  xExpect(transformData).toHaveReturnedTimes(2)
})
```

### Testing Event Handlers

```ts
test('event handlers are called correctly', () => {
  // Mock event handlers
  const onSuccess = xJet.fn()
  const onError = xJet.fn()
  const onComplete = xJet.fn()
  
  // Function with event handlers
  function processWithEvents(data, options) {
    try {
      // Processing
      if (data.valid) {
        onSuccess(data.result)
      } else {
        onError(new Error('Invalid data'))
      }
    } finally {
      onComplete()
    }
  }
  
  // Test success path
  processWithEvents({ valid: true, result: 'success' })
  xExpect(onSuccess).toHaveBeenCalledWith('success')
  xExpect(onError).not.toHaveBeenCalled()
  xExpect(onComplete).toHaveBeenCalled()
  
  // Reset mocks
  xJet.clearAllMocks()
  
  // Test error path
  processWithEvents({ valid: false })
  xExpect(onSuccess).not.toHaveBeenCalled()
  xExpect(onError).toHaveBeenCalledWith(xExpect.any(Error))
  xExpect(onComplete).toHaveBeenCalled()
})
```
