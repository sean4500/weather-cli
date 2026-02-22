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
 * Fetch current conditions and forecast from NOAA Weather API.
 */
export async function fetchNOAAWeather(config) {
  const { WEATHER_LAT, WEATHER_LON, NOAA_USER_AGENT } = config;
  const headers = { 'User-Agent': NOAA_USER_AGENT };

  // 1. Get metadata to find forecast and station URLs
  const pointsUrl = `https://api.weather.gov/points/${WEATHER_LAT},${WEATHER_LON}`;
  const pointsRes = await fetch(pointsUrl, { headers });
  if (!pointsRes.ok) throw new Error(`NOAA Points API failed: ${pointsRes.status}`);
  const pointsData = await pointsRes.json();

  const forecastUrl = pointsData.properties.forecast;
  const stationsUrl = pointsData.properties.observationStations;

  // 2. Get Forecast and Stations in parallel
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
