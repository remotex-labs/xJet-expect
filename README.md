# xJet Matcher Utilities
[![npm version](https://img.shields.io/badge/Documentation-orange?logo=typescript&logoColor=f5f5f5)](https://remotex-labs.github.io/xJet-expect/)
[![npm version](https://img.shields.io/npm/v/@remotex-labs/xjet-expect.svg)](https://www.npmjs.com/package/@remotex-labs/xjet-expect)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![Node.js CI](https://github.com/remotex-labs/xJet-expect/actions/workflows/node.js.yml/badge.svg)](https://github.com/remotex-labs/xJet-expect/actions/workflows/node.js.yml)

A TypeScript-based matcher library for testing mocks and verifying function calls, thrown errors, and returned values.  
Inspired by Jest-style assertions with xJet support for extended mock / spy in esm.

## Installation
Install via npm:

``` bash
npm install --save-dev @remotex-labs/xjet-expect
```

Or using yarn:

``` bash
yarn add @remotex-labs/xjet-expect
```

## Features
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **Modern ESM Support**: Works seamlessly with ES modules
- **Detailed Error Messages**: Helpful, colorized error output for failed assertions
- **Asymmetric Matchers**: Flexible partial matching for complex objects
- **Mock Tracking**: Comprehensive mock function call tracking and assertions
- **Promise Testing**: First-class support for async/await and Promise testing

## Quick Start

```ts
import { expect, test } from '@remotex-labs/xjet-expect';

test('basic assertions', () => {
  // Equality
  expect(2 + 2).toBe(4);
  expect({ name: 'test' }).toEqual({ name: 'test' });
  
  // Truthiness
  expect(true).toBeTruthy();
  expect(null).toBeFalsy();
  
  // Numbers
  expect(10).toBeGreaterThan(5);
  expect(5).toBeLessThanOrEqual(5);
  
  // Strings
  expect('hello world').toContain('world');
  expect('test string').toMatch(/test/);
  
  // Objects
  expect({ user: { name: 'John' } }).toHaveProperty('user.name');
});
```

## Mock Functions
```ts
import { expect, test, jest } from '@remotex-labs/xjet-expect';

test('mock function calls', () => {
  const mockFn = jest.fn();
  
  mockFn('first call');
  mockFn('second call');
  
  // Verify calls
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith('first call');
  expect(mockFn).toHaveBeenLastCalledWith('second call');
  expect(mockFn).toHaveBeenNthCalledWith(1, 'first call');
});

test('mock return values', () => {
  const mockFn = jest.fn()
    .mockReturnValueOnce('first')
    .mockReturnValueOnce('second');
  
  expect(mockFn()).toBe('first');
  expect(mockFn()).toBe('second');
  
  expect(mockFn).toHaveReturned();
  expect(mockFn).toHaveReturnedTimes(2);
  expect(mockFn).toHaveLastReturnedWith('second');
  expect(mockFn).toHaveNthReturnedWith(1, 'first');
});
```

## Async Testing
```ts
import { expect, test } from '@remotex-labs/xjet-expect';

test('async functions', async () => {
  // Promise resolution
  await expect(Promise.resolve('success')).resolves.toBe('success');
  await expect(Promise.resolve({ id: 123 })).resolves.toHaveProperty('id');
  
  // Promise rejection
  await expect(Promise.reject(new Error('failed'))).rejects.toThrow('failed');
  
  // Async functions
  const fetchData = async () => ({ id: 123, name: 'test' });
  await expect(fetchData()).resolves.toEqual(
    expect.objectContaining({ id: expect.any(Number) })
  );
});
```

## Asymmetric Matchers
```ts
import { expect, test } from '@remotex-labs/xjet-expect';

test('flexible assertions with asymmetric matchers', () => {
  const user = {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    roles: ['user', 'admin']
  };
  
  expect(user).toEqual(expect.objectContaining({
    id: expect.any(Number),
    name: expect.stringContaining('John'),
    email: expect.stringMatching(/^.+@example\.com$/),
    createdAt: expect.any(Date),
    roles: expect.arrayContaining(['admin'])
  }));
});
```

## Custom Matchers
```ts
import { expect } from '@remotex-labs/xjet-expect';

// Define a custom matcher
expect.extend({
  toBeEvenNumber(received) {
    const pass = typeof received === 'number' && received % 2 === 0;
    
    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be an even number`
    };
  }
});

// Use custom matcher
test('custom matchers', () => {
  expect(4).toBeEvenNumber();
  expect(3).not.toBeEvenNumber();
});
```

## Documentation
For complete API documentation, examples, and guides, visit: [xJet-expect Documentation](https://remotex-labs.github.io/xJet-expect/)

## Compatibility
- Node.js 20+
- All modern browsers (via bundlers)
- TypeScript 4.5+
- Compatible with Jest assertions for easy migration

## Contributing
Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License
This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Inspired by Jest's expect API
- Built with TypeScript
- Powered by the xJet ecosystem
