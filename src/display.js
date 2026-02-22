/**
 * Handles terminal output formatting.
 */
import pc from 'picocolors';
import { abbreviateCardinalDirection } from './api.js';

export function displayCurrent(stationData, noaaCurrent) {
  console.log(pc.bold(pc.cyan('\n--- Current Conditions ---')));
  
  const temp = pc.yellow(stationData.tempf + '°F');
  const condition = pc.blue(noaaCurrent.textDescription);
  const feelsLike = pc.yellow(stationData.feelsLike + '°F');
  const humidity = pc.magenta(stationData.humidity + '%');
  const windDir = abbreviateCardinalDirection(stationData.winddir);
  const wind = pc.green(`${windDir} ${stationData.windspeedmph} mph (Gust: ${stationData.windgustmph} mph)`);
  const baro = pc.cyan(stationData.baromrelin + ' inHg');

  console.log(`Condition: ${condition}`);
  console.log(`Temp:      ${temp} (Feels like: ${feelsLike})`);
  console.log(`Humidity:  ${humidity}`);
  console.log(`Barometer: ${baro}`);

  // Extra Station Data
  if (stationData.uv !== undefined) {
    console.log(`UV Index:  ${pc.red(stationData.uv)}`);
  }

  console.log(`Wind:      ${wind}`);

  if (stationData.maxdailygust !== undefined) {
    console.log(`Max Gust:  ${pc.green(stationData.maxdailygust + ' mph')}`);
  }
  
  if (stationData.hourlyrainin !== undefined || stationData.dailyrainin !== undefined) {
    const hourly = stationData.hourlyrainin || 0;
    const daily = stationData.dailyrainin || 0;
    console.log(`Rain:      ${pc.blue(hourly + ' in/hr')} (Today: ${pc.blue(daily + ' in')})`);
  }

  if (stationData.lastRain) {
    const lastRainDate = new Date(stationData.lastRain);
    console.log(`Last Rain: ${pc.dim(lastRainDate.toLocaleString())}`);
  }
}

export function displayForecast(forecastData) {
  console.log(pc.bold(pc.cyan('\n--- 7-Day Forecast ---')));

  // Define column widths for consistency
  const colWidths = {
    dayDate: 12,
    condition: 21,
    temp: 14,
    rain: 10,
    wind: 20
  };

  // Build the header
  const header = 
    'Day  Date'.padEnd(colWidths.dayDate) +
    'Condition'.padEnd(colWidths.condition) +
    'High / Low'.padEnd(colWidths.temp) +
    'Rain %'.padEnd(colWidths.rain) +
    'Wind';

  console.log(pc.dim(header));
  console.log(pc.dim('-'.repeat(header.length + 5)));

  const periods = forecastData.periods;
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    if (!period.isDaytime) continue;

    const nextPeriod = periods[i + 1];
    const date = new Date(period.startTime);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Column 1: Day & Date
    const dayDateText = `${dayOfWeek}  ${date.getMonth() + 1}/${date.getDate()}`;
    const col1 = dayDateText.padEnd(colWidths.dayDate);

    // Column 2: Condition
    const col2 = period.shortForecast.padEnd(colWidths.condition);

    // Column 3: Temperatures (Manual padding for colors)
    const high = pc.red(period.temperature + '°');
    const lowVal = nextPeriod && !nextPeriod.isDaytime ? nextPeriod.temperature : '--';
    const low = pc.blue(lowVal + '°');
    const tempText = `${period.temperature}° / ${lowVal}°`;
    const col3 = `${high} / ${low}${' '.repeat(Math.max(0, colWidths.temp - tempText.length))}`;

    // Column 4: Rain % (Manual padding for colors)
    const probValue = period.probabilityOfPrecipitation?.value;
    const rainText = probValue !== null ? probValue + '%' : '--%';
    const rainColor = probValue !== null ? pc.blue(rainText) : pc.dim(rainText);
    const col4 = `${rainColor}${' '.repeat(Math.max(0, colWidths.rain - rainText.length))}`;

    // Column 5: Wind
    const col5 = pc.green(period.windSpeed + ' ' + period.windDirection);

    console.log(`${col1}${col2}${col3}${col4}${col5}`);
  }
  console.log('');
}
