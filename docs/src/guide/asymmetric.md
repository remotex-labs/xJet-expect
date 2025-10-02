# Asymmetric Matchers
Asymmetric matchers provide flexible ways to verify that values meet certain conditions without requiring exact equality.
They're especially useful when only certain aspects of an object need validation or when dealing with dynamic data.

## Basic Usage
Asymmetric matchers can be used in any xJet assertion that compares values:

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

## Where Asymmetric Matchers Can Be Used
Asymmetric matchers work with multiple matchers across the xJet testing framework:

```ts
// In equality assertions
xExpect({ name: 'Alice' }).toEqual({ name: xExpect.any(String) });

// In function call assertions
xExpect(mockFunction).toHaveBeenCalledWith(xExpect.objectContaining({ id: 123 }));

// In strict equality checks (only at root level)
xExpect({ name: 'Alice' }).toBe(xExpect.any(Object));

// In exception testing
xExpect(() => validateEmail('')).toThrow(xExpect.objectContaining({ 
  code: 'VALIDATION_ERROR' 
}));

// In array content assertions
xExpect(['apple', 'banana']).toContainEqual(xExpect.stringMatching(/^a/));

// In partial object matching
xExpect(response).toMatchObject({
  users: xExpect.arrayContaining([{ role: 'admin' }])
});

```

::: tip
Each matcher includes information about whether it supports **Asymmetric Matchers**.
:::


## any

`.any(constructor)`
Matches any value created by the specified constructor.

```ts
test('value type checking', () => {
    xExpect({ name: 'Alice' }).toEqual({ name: xExpect.any(String) });
    xExpect(Math.round(2)).toBe(xExpect.any(Number));

    // With class instances
    class User {}
    const user = new User();
    xExpect(user).toEqual(xExpect.any(User));
});

```

## anything

`.anything()`
Matches any non-null, non-undefined value.

```ts
test('verifies value exists', () => {
  const response = { data: 'something', timestamp: Date.now() };
  
  xExpect(response).toEqual({
    data: xExpect.anything(),
    timestamp: xExpect.anything()
  });
});

```

## closeTo

`.closeTo(value, precision)`
Matches numbers that are close to a target value within a specified precision.

```ts
test('approximate calculations', () => {
  const result = 0.1 + 0.2; // 0.30000000000000004 due to floating-point
  
  xExpect(result).toEqual(xExpect.closeTo(0.3, 0.001));
});

```

## arrayOf

`.arrayOf(pattern)`
Matches an array where every element matches the specified pattern.

```ts
xExpect([ 'apple', 'banana', 'cherry' ]).toEqual(
    xExpect.arrayOf(xExpect.any(String)),
);
```

## stringMatching

`xExpect.stringMatching(pattern)`
Matches strings against a regular expression pattern.

```ts
test('string format validation', () => {
  const email = 'user@example.com';
  
  xExpect(email).toEqual(
    xExpect.stringMatching(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)
  );
  
  // In objects
  const user = { email: 'admin@company.org', role: 'ADMIN' };
  xExpect(user).toEqual({
    email: xExpect.stringMatching(/.+@company\.org$/),
    role: xExpect.stringMatching(/^[A-Z]+$/)
  });
});
```

## arrayContaining

`xExpect.arrayContaining(items)`
Matches arrays that contain all the specified items, regardless of order.

```ts
test('array includes required elements', () => {
  const fruits = ['apple', 'banana', 'orange', 'grape'];
  
  xExpect(fruits).toEqual(xExpect.arrayContaining(['banana', 'apple']));
  
  // With response data
  const response = {
    users: ['admin', 'user1', 'user2'],
    permissions: ['read', 'write']
  };
  
  xExpect(response).toEqual({
    users: xExpect.arrayContaining(['admin']),
    permissions: xExpect.arrayContaining(['read', 'write'])
  });
});
```

## objectContaining

`.objectContaining(object)`
Matches objects that have at least the specified properties with matching values.

```ts
test('object structure validation', () => {
    const user = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        preferences: {
            theme: 'dark',
            notifications: true
        }
    };

    xExpect(user).toEqual(xExpect.objectContaining({
        name: 'John',
        preferences: xExpect.objectContaining({
            theme: 'dark'
        })
    }));
});
```

## stringContaining

`.stringContaining(substring)`
Matches strings that contain the specified substring.

```ts
test('string content validation', () => {
  const message = 'Operation completed successfully';
  
  xExpect(message).toEqual(xExpect.stringContaining('completed'));
  
  // With error messages
  const error = new Error('Invalid input: missing required field');
  xExpect(error.message).toEqual(xExpect.stringContaining('missing required'));
});

```

## Negated Matchers with `.not`
Use the namespace to negate any matcher's behavior: `.not`

```ts
test('using negated matchers', () => {
  const data = {
    temperature: 25.2,
    status: 'warning',
    tags: ['important', 'urgent']
  };
  
  // Value is not close to the specified number
  xExpect(data.temperature).toEqual(xExpect.not.closeTo(0, 1));
  
  // String doesn't match pattern
  xExpect(data.status).toEqual(xExpect.not.stringMatching(/^error/));
  
  // Array doesn't contain these elements
  xExpect(data.tags).toEqual(xExpect.not.arrayContaining(['low-priority']));
});

```
