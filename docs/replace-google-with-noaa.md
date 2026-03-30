# Implementation Plan: Replace Google Weather API with NOAA Weather API

This plan outlines the steps to replace the Google Weather API with the NOAA Weather API in the `weather-cli` tool.

## Phase 1: Update API Client (`src/api.js`)
- [x] Implement `fetchNOAAWeather(config)` function:
  - Fetch metadata from `https://api.weather.gov/points/${lat},${lon}`.
  - Fetch forecast from the provided `forecast` URL.
  - Fetch the nearest observation station and its latest observation.
  - Include a `User-Agent` header as required by NOAA.
- [x] Remove `fetchGoogleWeather` if no longer needed.

## Phase 2: Update Entry Point (`src/index.js`)
- [x] Replace `fetchGoogleWeather` imports and calls with `fetchNOAAWeather`.
- [x] Update `checkConfig` to remove the requirement for `GOOGLE_WEATHER_API_KEY`.
- [x] Update the default coordinates or ensure they are used correctly.

## Phase 3: Update Display Logic (`src/display.js`)
- [x] Update `displayCurrent` to use NOAA's `textDescription` for weather conditions.
- [x] **Implement ASCII Weather Icons:**
  - Create a helper function `getAsciiIcon(iconUrl)` to parse the NOAA icon URL.
  - Map icon codes to ASCII art representations based on research:
    - **Clear/Fair:** `skc`, `few` -> Sun (Day) / Moon (Night)
    - **Cloudy:** `sct`, `bkn`, `ovc` -> Sun+Cloud (Day) / Moon+Cloud (Night) / Cloud
    - **Rain:** `ra`, `ra1`, `shra`, `hi_shwrs` -> Cloud + Rain
    - **Snow:** `sn`, `blz` -> Cloud + Snow
    - **Thunderstorm:** `tsra` -> Cloud + Lightning
    - **Fog/Mist:** `fg`, `mist`, `smoke` -> Fog lines
  - Handle day/night variations (parsed from URL `.../day/...` or `.../night/...`).
  - Display the ASCII icon above the current conditions text.
- [x] Update `displayForecast` to handle NOAA's 12-hour periods:
  - Group periods into days (combining daytime and nighttime temperatures).
  - Format dates and conditions to match the existing table layout.

## Phase 4: Verification
- [x] Run `node src/index.js current` and `node src/index.js forecast` to verify output.
- [x] Ensure Ambient Weather data (temp, humidity, etc.) is still displayed correctly alongside NOAA's condition data.

## Proposed Code Snippets

### `src/api.js` - New `fetchNOAAWeather`
```javascript
export async function fetchNOAAWeather(config) {
  const { WEATHER_LAT, WEATHER_LON } = config;
  const headers = { 'User-Agent': 'weather-cli (https://github.com/sean4500/weather-cli)' };

  // 1. Get metadata to find forecast and station URLs
  const pointsUrl = `https://api.weather.gov/points/${WEATHER_LAT},${WEATHER_LON}`;
  const pointsRes = await fetch(pointsUrl, { headers });
  if (!pointsRes.ok) throw new Error(`NOAA Points API failed: ${pointsRes.status}`);
  const pointsData = await pointsRes.json();

  const forecastUrl = pointsData.properties.forecast;
  const stationsUrl = pointsData.properties.observationStations;

  // 2. Get Forecast and Stations
  const [forecastRes, stationsRes] = await Promise.all([
    fetch(forecastUrl, { headers }),
    fetch(stationsUrl, { headers })
  ]);

  if (!forecastRes.ok) throw new Error(`NOAA Forecast API failed: ${forecastRes.status}`);
  if (!stationsRes.ok) throw new Error(`NOAA Stations API failed: ${stationsRes.status}`);

  const forecastData = await forecastRes.json();
  const stationsData = await stationsRes.json();

  // 3. Get latest observation from the first station
  const stationId = stationsData.features[0].properties.stationIdentifier;
  const observationsUrl = `https://api.weather.gov/stations/${stationId}/observations/latest`;
  const observationsRes = await fetch(observationsUrl, { headers });
  
  if (!observationsRes.ok) throw new Error(`NOAA Observations API failed: ${observationsRes.status}`);
  const currentData = await observationsRes.json();

  return { 
    current: currentData.properties, 
    forecast: forecastData.properties 
  };
}
```

### `src/display.js` - ASCII Icon Logic
```javascript
function getAsciiIcon(iconUrl) {
  if (!iconUrl) return [];
  
  // Extract code (e.g., "few", "rain") and time (day/night)
  // URL example: https://api.weather.gov/icons/land/day/few?size=medium
  const parts = iconUrl.split('/');
  const isDay = parts.includes('day');
  const code = parts[parts.length - 1].split('?')[0].split(',')[0]; // Handle multi-codes like "few,20"

  const sun = pc.yellow('  \\   /  \n   .-.   \n― (   ) ―\n   `-’   \n  /   \\  ');
  const moon = pc.white('   .-.   \n  (   ). \n (__   ) \n    `-\'  ');
  const cloud = pc.white('   .--.   \n .-(    ). \n(___.__)__)');
  const rain = pc.blue('  ‘ ‘ ‘ ‘ \n ‘ ‘ ‘ ‘ ');
  const snow = pc.white('  * * * * \n * * * * ');
  const lightning = pc.yellow('   _/  \n  /    \n /_    ');

  // Basic mapping logic
  if (code.includes('skc') || code.includes('few')) {
    return isDay ? sun : moon;
  }
  if (code.includes('sct') || code.includes('bkn') || code.includes('ovc')) {
    return isDay ? 
      [
        pc.yellow('  \\   /  '),
        pc.white(' _.-.'),
        pc.white('(___.__)__)') 
      ].join('\n') : 
      [
        pc.white('   .-.   '),
        pc.white('  (   ). '),
        pc.white(' (__   ) ') 
      ].join('\n');
  }
  if (code.includes('rain') || code.includes('shra')) {
     return cloud + '\n' + rain;
  }
  // ... Add more mappings for snow, fog, thunder
  
  return cloud; // Default
}
```
