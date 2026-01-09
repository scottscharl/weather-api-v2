# @scottscharl/weather-api

A configurable weather API server with caching, security features, and OpenWeatherMap integration. This package provides both a programmatic API and a standalone server for weather data.

## Features

- 🌤️ OpenWeatherMap One Call API integration
- 🚀 Express.js server with security middleware
- 💾 Automatic weather data caching (5-minute intervals)
- 🔒 Configurable security profiles (development, production, strict)
- ⚡ Rate limiting and CORS protection
- 📦 Both programmatic API and CLI usage
- 🎯 Simplified and full weather data endpoints

## Installation

```bash
npm install @scottscharl/weather-api
```

## Quick Start

### As a Library

```javascript
const { WeatherAPI, getWeather } = require('@scottscharl/weather-api');

// Quick weather data
const weather = getWeather();
console.log(weather);

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

// Start server
api.startServer(() => {
  console.log('Server started!');
});
```

### As a Standalone Server

```bash
# Install globally for CLI usage
npm install -g @scottscharl/weather-api

# Or use npx
npx @scottscharl/weather-api server
```

### CLI Commands

```bash
# Start the server
weather-api server

# Get current weather
weather-api weather

# Get full weather data  
weather-api full

# Update weather cache
weather-api update

# Show configuration
weather-api config

# Help
weather-api --help
```

## Configuration

### Environment Variables

Create a `.env` file with your configuration:

```bash
# Required
OPENWEATHER_KEY=your_openweather_api_key_here

# Optional overrides (see config.js for defaults)
SECURITY_PROFILE=development
PORT=4000
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_NAME="Washington, DC"
CORS_ORIGIN="http://localhost:3000,http://localhost:4000"
```

### Security Profiles

The package includes three security profiles:

- **development**: High rate limits (1000/hour), localhost CORS
- **production**: Moderate rate limits (100/hour), configurable CORS
- **strict**: Low rate limits (50/hour), tight security

## API Endpoints

When running as a server:

- `GET /api/` - Simplified weather data
- `GET /api/full` - Complete weather data

## Setup

1. Get an API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Create a `.env` file with your `OPENWEATHER_KEY`
3. Configure your location and security preferences (optional)

## Requirements

- Node.js ≥16.0.0
- NPM ≥7.0.0
- OpenWeatherMap API key
