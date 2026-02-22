# 🌦️ Weather CLI

A standalone command-line tool to check weather conditions and forecasts by combining data from your personal **Ambient Weather** station and the **Google Weather API**.

## Features

- **Current Conditions**: Real-time data from your Ambient Weather station (Temp, Humidity, Wind, Barometer).
- **Forecast**: 5-day weather forecast powered by Google Weather.
- **Colorized Output**: Easy-to-read terminal output using `picocolors`.

## Prerequisites

- **Node.js**: Version 18 or higher (uses native `fetch` and ESM).
- **API Keys**:
  - **Ambient Weather**: An API Key, Application Key, and Device ID from your [Ambient Weather Dashboard](https://ambientweather.net/account).
  - **Google Weather**: A Google Cloud API Key with access to the Weather API.

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
GOOGLE_WEATHER_API_KEY=your_google_key

# Optional: Defaults to Portland, OR if not set
WEATHER_LAT=45.4981
WEATHER_LON=-122.4314
```

## Usage

If you used `npm link`, you can run the command directly as `weather`. Otherwise, use `node src/index.js`.

### 1. View Everything (Default)
Fetches both current station data and the 5-day forecast.
```bash
weather
```

### 2. Current Conditions Only
```bash
weather current
```

### 3. 5-Day Forecast Only
```bash
weather forecast
```

### 4. Help
```bash
weather --help
```

## Project Structure

- `src/index.js`: Entry point and CLI command definitions using `commander`.
- `src/api.js`: API clients for Ambient Weather and Google Weather.
- `src/display.js`: Terminal output formatting and styling.

## License

MIT
