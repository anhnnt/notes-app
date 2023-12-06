const reverse = require('../utils/for_testing').reverse

test('reverse of a', () => {
  const res = reverse('a')

  expect(res).toBe('a')
})

test('reverse of react', () => {
  const res = reverse('react')

  expect(res).toBe('tcaer')
})

test('reverse of releveler', () => {
  const res = reverse('releveler')

  expect(res).toBe('releveler')
})