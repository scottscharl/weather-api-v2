# @scottscharl/weather-api

A weather API server with caching and OpenWeatherMap integration.

## Features

- OpenWeatherMap One Call API integration
- Automatic weather data caching (5-minute intervals)
- Rate limiting
- Optional API key authentication
- Simplified and full weather data endpoints

## Installation

```bash
npm install @scottscharl/weather-api
```

## Quick Start

### As a Standalone Server

```bash
# Clone and install
npm install

# Configure .env (see below)

# Start server
npm start
```

### As a Library

```javascript
const { WeatherAPI, getWeather } = require('@scottscharl/weather-api');

// Quick weather data
const weather = getWeather();

// Or create an instance with custom config
const api = new WeatherAPI({
  openWeatherKey: 'your-api-key',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'New York, NY'
  }
});

// Get weather data
const currentWeather = api.getWeather();
const fullWeather = api.getFullWeather();

// Update cache
await api.updateCache();
```

### CLI Commands

```bash
weather-api server      # Start the server
weather-api weather     # Get current weather
weather-api full        # Get full weather data
weather-api update      # Update weather cache
weather-api config      # Show configuration
weather-api --help      # Help
```

## Configuration

Create a `.env` file:

```bash
# Required
OPENWEATHER_KEY=your_openweather_api_key

# Location
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_NAME="Washington, DC"

# Server
PORT=4000

# API Key Authentication (optional - if not set, API is open)
API_KEY=your-secret-api-key

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

- `GET /api/` - Simplified weather data
- `GET /api/full` - Complete weather data

If `API_KEY` is configured, include the header:
```
x-api-key: your-secret-api-key
```

## Docker

```bash
docker build -t weather-api .
docker run -p 4000:4000 -e OPENWEATHER_KEY=your_key weather-api
```

## Requirements

- Node.js >= 16.0.0
- OpenWeatherMap API key
