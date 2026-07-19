import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanJsonResponse, parseJsonResponse } from '../prompts'

test('cleanJsonResponse returns input trimmed when no fence present', () => {
  const input = '  {"a":1}  '
  assert.equal(cleanJsonResponse(input), '{"a":1}')
})

test('cleanJsonResponse unwraps a ```json code fence', () => {
  const input = '```json\n{"a":1}\n```'
  assert.equal(cleanJsonResponse(input), '{"a":1}')
})

test('cleanJsonResponse unwraps a bare ``` fence', () => {
  const input = 'Here is the report:\n```\n{"a":1}\n```\nDone.'
  assert.equal(cleanJsonResponse(input), '{"a":1}')
})

test('cleanJsonResponse keeps only the outermost object when prose wraps it', () => {
  const input = 'Sure, here you go: {"a":1,"b":{"c":2}} hope that helps'
  assert.equal(cleanJsonResponse(input), '{"a":1,"b":{"c":2}}')
})

test('parseJsonResponse parses clean JSON directly', () => {
  assert.deepEqual(parseJsonResponse('{"a":1}'), { a: 1 })
})

test('parseJsonResponse repairs trailing commas', () => {
  const input = '{"a":1,"b":2,}'
  assert.deepEqual(parseJsonResponse(input), { a: 1, b: 2 })
})

test('parseJsonResponse repairs trailing commas in arrays', () => {
  const input = '{"list":[1,2,3,]}'
  assert.deepEqual(parseJsonResponse(input), { list: [1, 2, 3] })
})

test('parseJsonResponse strips control characters', () => {
  // \x01 is a SOH control char that breaks JSON.parse
  const input = '{"text":"hello\x01world"}'
  assert.deepEqual(parseJsonResponse(input), { text: 'helloworld' })
})

test('parseJsonResponse unwraps fenced JSON', () => {
  const input = '```json\n{"a":1,"b":[1,2,3]}\n```'
  assert.deepEqual(parseJsonResponse(input), { a: 1, b: [1, 2, 3] })
})

test('parseJsonResponse throws with a useful message on garbage input', () => {
  assert.throws(
    () => parseJsonResponse('not json at all'),
    /JSON parse failed/,
  )
})

test('parseJsonResponse preserves nested objects with commas', () => {
  const input = '{"outer":{"inner":1,},"list":[{"x":1,},]}'
  assert.deepEqual(
    parseJsonResponse(input),
    { outer: { inner: 1 }, list: [{ x: 1 }] },
  )
})