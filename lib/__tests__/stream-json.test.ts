import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractCompleteInsights, extractSegmentsDetected } from '../stream-json'

test('extractCompleteInsights returns empty array when buffer is empty', () => {
  assert.deepEqual(extractCompleteInsights(''), [])
})

test('extractCompleteInsights returns empty array when insights key is absent', () => {
  assert.deepEqual(extractCompleteInsights('{"other":[]}'), [])
})

test('extractCompleteInsights returns empty array when array has not opened yet', () => {
  assert.deepEqual(extractCompleteInsights('{"insights":'), [])
})

test('extractCompleteInsights parses a single complete insight', () => {
  const buffer =
    '{"insights":[{"text":"Users complain about latency","segment":"smb","source":"interview-1.txt","confidence":0.9}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].text, 'Users complain about latency')
  assert.equal(out[0].segment, 'smb')
  assert.equal(out[0].source, 'interview-1.txt')
  assert.equal(out[0].confidence, 0.9)
})

test('extractCompleteInsights parses multiple complete insights', () => {
  const buffer =
    '{"insights":[{"text":"a","segment":"smb","source":"f1","confidence":0.9},{"text":"b","segment":"enterprise","source":"f2","confidence":0.7}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 2)
  assert.equal(out[0].text, 'a')
  assert.equal(out[1].text, 'b')
})

test('extractCompleteInsights handles partial (incomplete) buffer', () => {
  // The second object is incomplete — we should only get the first.
  const buffer =
    '{"insights":[{"text":"a","segment":"smb","source":"f1","confidence":0.9},{"text":"b","segment":"ent'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].text, 'a')
})

test('extractCompleteInsights ignores braces inside string values', () => {
  // The insight text contains a `}` character which must not confuse the
  // brace-matching parser.
  const buffer =
    '{"insights":[{"text":"function() { return 1; } is bad","segment":"smb","source":"f1","confidence":0.8}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].text, 'function() { return 1; } is bad')
})

test('extractCompleteInsights ignores escaped quotes inside string values', () => {
  const buffer =
    '{"insights":[{"text":"He said \\"yes\\"","segment":"smb","source":"f1","confidence":0.8}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].text, 'He said "yes"')
})

test('extractCompleteInsights defaults missing fields to safe values', () => {
  const buffer = '{"insights":[{"text":"only text"}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].segment, 'general')
  assert.equal(out[0].source, '')
  assert.equal(out[0].confidence, 0.7)
})

test('extractCompleteInsights skips objects with empty text', () => {
  const buffer =
    '{"insights":[{"text":"","segment":"smb","source":"f1","confidence":0.9},{"text":"real","segment":"smb","source":"f1","confidence":0.9}]}'
  const out = extractCompleteInsights(buffer)
  assert.equal(out.length, 1)
  assert.equal(out[0].text, 'real')
})

test('extractSegmentsDetected returns null when key absent', () => {
  assert.equal(extractSegmentsDetected('{"insights":[]}'), null)
})

test('extractSegmentsDetected returns null when array is incomplete', () => {
  assert.equal(extractSegmentsDetected('{"segmentsDetected":["smb"'), null)
})

test('extractSegmentsDetected parses a complete array', () => {
  const out = extractSegmentsDetected('{"segmentsDetected":["smb","enterprise"]}')
  assert.deepEqual(out, ['smb', 'enterprise'])
})