/**
 * Handles terminal output formatting.
 */
import pc from 'picocolors';
import { abbreviateCardinalDirection } from './api.js';

export function displayCurrent(stationData, googleCurrent) {
  console.log(pc.bold(pc.cyan('\n--- Current Conditions ---')));
  
  const temp = pc.yellow(stationData.tempf + '°F');
  const condition = pc.blue(googleCurrent.weatherCondition.description.text);
  const feelsLike = pc.yellow(stationData.feelsLike + '°F');
  const humidity = pc.magenta(stationData.humidity + '%');
  const windDir = abbreviateCardinalDirection(stationData.winddir);
  const wind = pc.green(`${windDir} ${stationData.windspeedmph} mph (Gust: ${stationData.windgustmph} mph)`);
  const baro = pc.cyan(stationData.baromrelin + ' inHg');

  console.log(`Condition: ${condition}`);
  console.log(`Temp:      ${temp} (Feels like: ${feelsLike})`);
  console.log(`Wind:      ${wind}`);
  console.log(`Humidity:  ${humidity}`);
  console.log(`Barometer: ${baro}`);
}

export function displayForecast(forecastData) {
  console.log(pc.bold(pc.cyan('\n--- 5-Day Forecast ---')));

  // Simple table-like header
  console.log(pc.dim('Date       Condition          High / Low'));
  console.log(pc.dim('----------------------------------------'));

  forecastData.forecastDays.forEach((day) => {
    const dateStr = `${day.displayDate.month}/${day.displayDate.day}`.padEnd(10);
    const condition = day.daytimeForecast.weatherCondition.description.text.padEnd(18);
    const high = pc.red(day.maxTemperature.degrees + '°');
    const low = pc.blue(day.minTemperature.degrees + '°');
    
    console.log(`${dateStr} ${condition} ${high} / ${low}`);
  });
  console.log('');
}
