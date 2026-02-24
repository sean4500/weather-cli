/**
 * Handles terminal output formatting.
 */
import pc from 'picocolors';
import { abbreviateCardinalDirection } from './api.js';

export function getAsciiIcon(iconUrl) {
  if (!iconUrl) return '';
  
  // Extract code (e.g., "few", "rain") and time (day/night)
  // URL example: https://api.weather.gov/icons/land/day/few?size=medium
  const parts = iconUrl.split('/');
  const isDay = parts.includes('day');
  const code = parts[parts.length - 1].split('?')[0].split(',')[0]; // Handle multi-codes like "few,20"

  const sun = pc.yellow('  \\   /  \n   .-.   \n― (   ) ―\n   `-’   \n  /   \\  ');
  const moon = pc.white('   .-.   \n  (   ). \n   `-\'   \n    \'    ');
  const cloud = pc.white('   .--.   \n .-(    ). \n(___.__)__)');
  
  const sunCloud = isDay ? 
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

  const moonCloud = [
        pc.white('   .-.   '),
        pc.white('  (   ). '),
        pc.white('(___.__)__)') 
      ].join('\n');

  const rain = pc.blue('  ‘ ‘ ‘ ‘ \n ‘ ‘ ‘ ‘ ');
  const snow = pc.white('  * * * * \n * * * * ');
  const lightning = pc.yellow('   _/  \n  /    \n /_    ');
  const fog = pc.dim(' - - - - \n - - - - \n - - - - ');
  const wind = pc.cyan('   ~ ~ ~ \n  ~ ~ ~ ~\n   ~ ~ ~ ');

  // Mappings
  if (code.includes('wind')) {
    return wind;
  }
  if (code.includes('tsra')) {
    return cloud + '\n' + lightning;
  }
  if (code.includes('sn') || code.includes('blz') || code.includes('snow')) {
    return cloud + '\n' + snow;
  }
  if (code.includes('rain') || code.includes('ra') || code.includes('shra') || code.includes('hi_shwrs')) {
     return cloud + '\n' + rain;
  }
  if (code.includes('fg') || code.includes('mist') || code.includes('smoke')) {
    return fog;
  }
  if (code.includes('skc') || code.includes('few')) {
    return isDay ? sun : moon;
  }
  if (code.includes('sct') || code.includes('bkn') || code.includes('ovc')) {
    return isDay ? sunCloud : moonCloud;
  }
  
  return cloud; // Default
}

export function displayCurrent(stationData, noaaCurrent, forecastCurrent = null) {
  console.log(pc.bold(pc.cyan('\n--- Current Conditions ---')));

  // Use forecast as fallback if current observation is missing details
  const iconUrl = noaaCurrent.icon || (forecastCurrent ? forecastCurrent.icon : null);
  const description = noaaCurrent.textDescription || (forecastCurrent ? forecastCurrent.shortForecast : 'N/A');

  // ASCII Icon
  const icon = getAsciiIcon(iconUrl);
  if (icon) {
    console.log(icon);
    console.log(''); // Spacing
  }
  
  const condition = pc.blue(description);
  console.log(`Condition: ${condition}`);

  if (stationData) {
    const temp = pc.yellow(stationData.tempf + '°F');
    const feelsLike = pc.yellow(stationData.feelsLike + '°F');
    const humidity = pc.magenta(stationData.humidity + '%');
    const windDir = abbreviateCardinalDirection(stationData.winddir);
    const wind = pc.green(`${windDir} ${stationData.windspeedmph} mph (Gust: ${stationData.windgustmph} mph)`);
    const baro = pc.cyan(stationData.baromrelin + ' inHg');

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
  } else {
    // Fallback to NOAA data if no station data
    if (noaaCurrent.temperature.value !== null) {
      const tempC = noaaCurrent.temperature.value;
      const tempF = (tempC * 9/5) + 32;
      console.log(`Temp:      ${pc.yellow(tempF.toFixed(1) + '°F')}`);
    }
  }
}

// Helper to wrap text into multiple lines
export const wrapText = (text, width) => {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > width) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
};

export function displayForecast(forecastData) {
  console.log(pc.bold(pc.cyan('\n--- 7-Day Forecast ---')));

  // Define column widths for consistency
  const colWidths = {
    dayDate: 12,
    condition: 32,
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
    'Wind'.padEnd(colWidths.wind);

  console.log(pc.dim(header));
  console.log(pc.dim('-'.repeat(header.length)));

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

    // Column 2: Condition (Wrapped)
    const conditionLines = wrapText(period.shortForecast, colWidths.condition - 2);
    const col2 = (conditionLines[0] || '').padEnd(colWidths.condition);

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

    // Print the first line of the row
    console.log(`${col1}${col2}${col3}${col4}${col5}`);

    // Print subsequent lines for wrapped conditions
    for (let j = 1; j < conditionLines.length; j++) {
      const padding = ' '.repeat(colWidths.dayDate);
      const extraLine = conditionLines[j].padEnd(colWidths.condition);
      console.log(`${padding}${extraLine}`);
    }
  }
  console.log('');
}
