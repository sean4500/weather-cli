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
  console.log(pc.bold(pc.cyan('\n--- 5-Day Forecast ---')));

  // Simple table-like header
  console.log(pc.dim('Date       Condition          High / Low'));
  console.log(pc.dim('----------------------------------------'));

  const periods = forecastData.periods;
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    // Skip nighttime periods for the main row, but use their temp as the "low"
    if (!period.isDaytime) continue;

    const nextPeriod = periods[i + 1];
    const date = new Date(period.startTime);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`.padEnd(10);
    const condition = period.shortForecast.padEnd(18);
    const high = pc.red(period.temperature + '°');
    const low = nextPeriod && !nextPeriod.isDaytime ? pc.blue(nextPeriod.temperature + '°') : pc.blue('--°');

    console.log(`${dateStr} ${condition} ${high} / ${low}`);
  }
  console.log('');
}
