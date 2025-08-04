test('hi', () => {
    console.log('hi');

    expect(() => 'asdf').toThrow()
});
