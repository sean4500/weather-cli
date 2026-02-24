# 🌦️ Weather CLI

A standalone command-line tool to check weather conditions and forecasts by combining data from your personal **Ambient Weather** station and the **NOAA Weather API**.

## Features

### Current Conditions
Real-time data from your Ambient Weather station (Temp, Humidity, Wind, Barometer).
```bash
--- Current Conditions ---
   .--.
 .-(    ).
(___.__)__)
  ‘ ‘ ‘ ‘
 ‘ ‘ ‘ ‘

Condition: Light Rain and Fog/Mist
Temp:      39.9°F (Feels like: 39.9°F)
Humidity:  99%
Barometer: 29.651 inHg
UV Index:  0
Wind:      S 0 mph (Gust: 0 mph)
Max Gust:  5.82 mph
Rain:      0.07 in/hr (Today: 1.37 in)
Last Rain: 2/23/2026, 8:35:00 PM
```

### Forecast 
7-day weather forecast powered by NOAA Weather

```bash
--- 7-Day Forecast ---
Day  Date   Condition                       High / Low    Rain %    Wind
----------------------------------------------------------------------------------------
Tue  2/24   Light Rain                      47° / 37°     75%       7 to 10 mph NNE
Wed  2/25   Chance Light Rain               48° / 35°     52%       7 to 10 mph SW
Thu  2/26   Chance Light Rain               50° / 37°     37%       7 to 10 mph SW
Fri  2/27   Chance Light Rain               49° / 33°     31%       9 mph WSW
Sat  2/28   Slight Chance Light Rain        49° / 32°     16%       5 to 9 mph N
Sun  3/1    Sunny                           50° / 32°     14%       6 to 10 mph NE
Mon  3/2    Rain And Snow Likely            52° / --°     18%       6 to 9 mph NE
```
**Colorized Output**: Easy-to-read terminal output using `picocolors`.

## Prerequisites

- **Node.js**: Version 18 or higher (uses native `fetch` and ESM).
- **API Keys**:
  - **Ambient Weather**: An API Key, Application Key, and Device ID from your [Ambient Weather Dashboard](https://ambientweather.net/account).
  - **NOAA Weather**: No API key required, but a `User-Agent` string is required by the [NOAA API](https://www.weather.gov/documentation/services-web-api).

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd weather-cli
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Link the command** (Optional):
   To use the `weather` command globally from anywhere in your terminal:
   ```bash
   npm link
   ```

## Configuration

The tool requires several environment variables to function. You can create a `.env` file in the root directory or export them in your shell profile (e.g., `~/.zshrc` or `~/.bashrc`).

### `.env` Example

Create a file named `.env` in the root of the project:

```env
AMBIENT_DEVICE_ID=your_device_id
AMBIENT_APPLICATION_KEY=your_app_key
AMBIENT_API_KEY=your_api_key
NOAA_USER_AGENT=your-app-name (your-contact-email@example.com)

# Optional: Defaults to Portland, OR if not set
WEATHER_LAT=45.4981
WEATHER_LON=-122.4314
```

## Usage

If you used `npm link`, you can run the command directly as `weather`. Otherwise, use `node src/index.js`.

### 1. View Everything (Default)
Fetches both current station data and the 7-day forecast.
```bash
weather
```

### 2. Current Conditions Only
```bash
weather current
```

### 3. 7-Day Forecast Only
```bash
weather forecast
```

### 4. Custom Location
You can specify a location string to get the weather for another area. This will use OpenStreetMap to resolve the coordinates and fetch data from NOAA. (Note: Station data is skipped for custom locations).
```bash
weather forecast --location="Sisters, OR"
# or shorthand
weather -l "Prineville, OR"
```

### 5. Help
```bash
weather --help
```

## Project Structure

- `src/index.js`: Entry point and CLI command definitions using `commander`.
- `src/api.js`: API clients for Ambient Weather and NOAA Weather.
- `src/display.js`: Terminal output formatting and styling.

## License

MIT
