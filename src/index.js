#!/usr/bin/env node

/**
 * Weather CLI Entry Point
 */

import 'dotenv/config';
import { program } from 'commander';
import pc from 'picocolors';
import { fetchStationData, fetchNOAAWeather } from './api.js';
import { displayCurrent, displayForecast } from './display.js';

const config = {
  AMBIENT_DEVICE_ID: process.env.AMBIENT_DEVICE_ID,
  AMBIENT_APPLICATION_KEY: process.env.AMBIENT_APPLICATION_KEY,
  AMBIENT_API_KEY: process.env.AMBIENT_API_KEY,
  WEATHER_LAT: process.env.WEATHER_LAT || '45.4981',
  WEATHER_LON: process.env.WEATHER_LON || '-122.4314'
};

const checkConfig = () => {
  const missing = [];
  if (!config.AMBIENT_DEVICE_ID) missing.push('AMBIENT_DEVICE_ID');
  if (!config.AMBIENT_APPLICATION_KEY) missing.push('AMBIENT_APPLICATION_KEY');
  if (!config.AMBIENT_API_KEY) missing.push('AMBIENT_API_KEY');

  if (missing.length > 0) {
    console.error(pc.red(pc.bold('Error: Missing environment variables!')));
    console.error(pc.red(`Please set the following in your shell or .env file: ${missing.join(', ')}`));
    console.error(pc.dim('\nExample for ~/.zshrc:'));
    console.error(pc.dim('export AMBIENT_API_KEY="your_key"'));
    process.exit(1);
  }
};

program
  .name('weather')
  .description('Standalone CLI to check weather from your station and NOAA APIs')
  .version('1.0.0');

program
  .command('current')
  .description('Show current weather conditions')
  .action(async () => {
    checkConfig();
    try {
      const station = await fetchStationData(config);
      const noaa = await fetchNOAAWeather(config);
      displayCurrent(station, noaa.current);
    } catch (err) {
      console.error(pc.red(`Failed to fetch current weather: ${err.message}`));
    }
  });

program
  .command('forecast')
  .description('Show 7-day weather forecast')
  .action(async () => {
    checkConfig();
    try {
      const noaa = await fetchNOAAWeather(config);
      displayForecast(noaa.forecast);
    } catch (err) {
      console.error(pc.red(`Failed to fetch forecast: ${err.message}`));
    }
  });

// Default action (if no command is provided)
program
  .action(async () => {
    checkConfig();
    try {
      console.log(pc.bold(pc.green('Fetching weather data for ' + config.WEATHER_LAT + ', ' + config.WEATHER_LON + '...')));
      
      const [station, noaa] = await Promise.all([
        fetchStationData(config),
        fetchNOAAWeather(config)
      ]);

      displayCurrent(station, noaa.current);
      displayForecast(noaa.forecast);
      
    } catch (err) {
      console.error(pc.red(`Failed to fetch weather data: ${err.message}`));
    }
  });

program.parse(process.argv);
