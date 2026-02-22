/**
 * API client for Ambient Weather and Google Weather.
 */

/**
 * Port of abbreviateCardinalDirection from weather-api
 */
export function abbreviateCardinalDirection(direction) {
  // Handle degrees if passed as a number
  if (typeof direction === 'number') {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((direction %= 360) < 0 ? direction + 360 : direction) / 45) % 8;
    return directions[index];
  }

  const cardinalMap = {
    'NORTH': 'N',
    'SOUTH': 'S',
    'EAST': 'E',
    'WEST': 'W',
    'NORTHEAST': 'NE',
    'NORTHWEST': 'NW',
    'SOUTHEAST': 'SE',
    'SOUTHWEST': 'SW',
    'NORTH-NORTHEAST': 'NNE',
    'EAST-NORTHEAST': 'ENE',
    'EAST-SOUTHEAST': 'ESE',
    'SOUTH-SOUTHEAST': 'SSE',
    'SOUTH-SOUTHWEST': 'SSW',
    'WEST-SOUTHWEST': 'WSW',
    'WEST-NORTHWEST': 'WNW',
    'NORTH-NORTHWEST': 'NNW'
  }

  if(!direction || typeof direction !== 'string'){
    return direction;
  }

  const sanitizedDirection = direction.toUpperCase().replace(/_/g, '-')
  return cardinalMap[sanitizedDirection] || direction;
}

/**
 * Fetch current station data from Ambient Weather REST API.
 */
export async function fetchStationData(config) {
  const { AMBIENT_DEVICE_ID, AMBIENT_APPLICATION_KEY, AMBIENT_API_KEY } = config;
  
  const url = new URL(`https://rt.ambientweather.net/v1/devices/${AMBIENT_DEVICE_ID}`);
  url.searchParams.append('applicationKey', AMBIENT_APPLICATION_KEY);
  url.searchParams.append('apiKey', AMBIENT_API_KEY);
  url.searchParams.append('limit', '1');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ambient Weather API failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data[0];
}

/**
 * Fetch current conditions and forecast from Google Weather API.
 */
export async function fetchGoogleWeather(config) {
  const { GOOGLE_WEATHER_API_KEY, WEATHER_LAT, WEATHER_LON } = config;
  
  // Fetch Current Conditions
  const currentUrl = new URL('https://weather.googleapis.com/v1/currentConditions:lookup');
  currentUrl.searchParams.append('key', GOOGLE_WEATHER_API_KEY);
  currentUrl.searchParams.append('location.latitude', WEATHER_LAT);
  currentUrl.searchParams.append('location.longitude', WEATHER_LON);
  currentUrl.searchParams.append('units_system', 'IMPERIAL');

  // Fetch Forecast
  const forecastUrl = new URL('https://weather.googleapis.com/v1/forecast/days:lookup');
  forecastUrl.searchParams.append('key', GOOGLE_WEATHER_API_KEY);
  forecastUrl.searchParams.append('location.latitude', WEATHER_LAT);
  forecastUrl.searchParams.append('location.longitude', WEATHER_LON);
  forecastUrl.searchParams.append('days', '5');
  forecastUrl.searchParams.append('units_system', 'IMPERIAL');

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl)
  ]);

  if (!currentRes.ok) throw new Error(`Google Current Conditions API failed: ${currentRes.status}`);
  if (!forecastRes.ok) throw new Error(`Google Forecast API failed: ${forecastRes.status}`);

  const [current, forecast] = await Promise.all([
    currentRes.json(),
    forecastRes.json()
  ]);

  // Clean up cardinal directions in forecast
  forecast.forecastDays.forEach((day) => {
    day.daytimeForecast.wind.direction.cardinal = abbreviateCardinalDirection(day.daytimeForecast.wind.direction.cardinal);
    day.nighttimeForecast.wind.direction.cardinal = abbreviateCardinalDirection(day.nighttimeForecast.wind.direction.cardinal);
  });

  return { current, forecast };
}
