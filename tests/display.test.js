import test from 'node:test';
import assert from 'node:assert';
import { wrapText, getAsciiIcon } from '../src/display.js';
import pc from 'picocolors';

test('getAsciiIcon returns correct icons for various conditions', () => {
  // Windy
  assert.ok(getAsciiIcon('https://api.weather.gov/icons/land/day/wind?size=medium').includes('~ ~ ~'));
  
  // Thunderstorm
  const tsra = getAsciiIcon('https://api.weather.gov/icons/land/day/tsra?size=medium');
  assert.ok(tsra.includes('(___.__)__)')); // Cloud part
  assert.ok(tsra.includes('_/')); // Lightning part

  // Snow
  const snow = getAsciiIcon('https://api.weather.gov/icons/land/day/snow?size=medium');
  assert.ok(snow.includes('(___.__)__)'));
  assert.ok(snow.includes('* * * *'));

  // Rain
  const rain = getAsciiIcon('https://api.weather.gov/icons/land/day/rain?size=medium');
  assert.ok(rain.includes('(___.__)__)'));
  assert.ok(rain.includes('‘ ‘ ‘ ‘'));

  // Fog
  assert.ok(getAsciiIcon('https://api.weather.gov/icons/land/day/fg?size=medium').includes('- - - -'));

  // Clear Day (Sun)
  assert.ok(getAsciiIcon('https://api.weather.gov/icons/land/day/few?size=medium').includes('\\   /'));

  // Clear Night (Moon)
  assert.ok(getAsciiIcon('https://api.weather.gov/icons/land/night/few?size=medium').includes('(   ).'));

  // Cloudy Day
  const cloudyDay = getAsciiIcon('https://api.weather.gov/icons/land/day/bkn?size=medium');
  assert.ok(cloudyDay.includes('\\   /'));
  assert.ok(cloudyDay.includes('(___.__)__)'));

  // Cloudy Night (Updated moonCloud)
  const cloudyNight = getAsciiIcon('https://api.weather.gov/icons/land/night/bkn?size=medium');
  assert.ok(cloudyNight.includes('(   ).'));
  assert.ok(cloudyNight.includes('(___.__)__)'), 'Night cloud icon should now include the cloud base');

  // Default
  assert.ok(getAsciiIcon('https://api.weather.gov/icons/land/day/unknown?size=medium').includes('(___.__)__)'));

  // Null/Empty
  assert.strictEqual(getAsciiIcon(null), '');
});

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
