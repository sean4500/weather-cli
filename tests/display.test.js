import test from 'node:test';
import assert from 'node:assert';
import { wrapText } from '../src/display.js';

test('wrapText correctly wraps long text', () => {
  const text = 'Slight Chance Showers and Thunderstorms';
  const width = 20;
  const result = wrapText(text, width);
  
  // Ensure we get multiple lines
  assert.ok(result.length > 1, 'Should have multiple lines');
  
  // Ensure no line exceeds the width (including some buffer)
  result.forEach(line => {
    assert.ok(line.length <= width, `Line "${line}" exceeds width ${width}`);
  });

  // Verify content remains intact
  assert.strictEqual(result.join(' '), text);
});

test('wrapText does not wrap short text', () => {
  const text = 'Sunny';
  const width = 20;
  const result = wrapText(text, width);
  
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0], 'Sunny');
});

test('wrapText handles empty strings', () => {
  assert.deepStrictEqual(wrapText('', 20), []);
  assert.deepStrictEqual(wrapText(null, 20), []);
});

test('wrapText handles very long single words', () => {
  const text = 'Supercalifragilisticexpialidocious';
  const width = 10;
  const result = wrapText(text, width);
  
  // Single words should still be returned as one line even if they exceed width
  // since we wrap on spaces
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0], text);
});
