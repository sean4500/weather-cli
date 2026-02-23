import test from 'node:test';
import assert from 'node:assert';
import { geocode } from '../src/api.js';

test('geocode returns coordinates for a valid location', async () => {
  // Mock global fetch
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('nominatim.openstreetmap.org')) {
      return {
        ok: true,
        json: async () => [{
          lat: '44.2909',
          lon: '-121.5492',
          display_name: 'Sisters, Oregon, United States'
        }]
      };
    }
    return { ok: false };
  };

  try {
    const result = await geocode('Sisters, OR', 'test-agent');
    assert.strictEqual(result.lat, '44.2909');
    assert.strictEqual(result.lon, '-121.5492');
    assert.strictEqual(result.display_name, 'Sisters, Oregon, United States');
  } finally {
    global.fetch = originalFetch;
  }
});

test('geocode throws error for invalid location', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => []
  });

  try {
    await assert.rejects(
      geocode('InvalidLocationXYZ', 'test-agent'),
      /Location not found/
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('geocode throws error on API failure', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 500
  });

  try {
    await assert.rejects(
      geocode('Sisters, OR', 'test-agent'),
      /Geocoding failed: 500/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
