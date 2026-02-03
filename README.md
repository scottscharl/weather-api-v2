# @scottscharl/weather-api

A simple weather API server with caching and OpenWeatherMap integration.

## Features

- OpenWeatherMap One Call API integration
- Automatic weather data caching (5-minute intervals)
- Rate limiting
- Optional API key authentication

## Quick Start

```bash
# Clone and install
npm install

# Configure .env (see below)

# Start server
npm start
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
docker run -p 4000:4000 --env-file .env weather-api
```

## Requirements

- Node.js >= 16.0.0
- OpenWeatherMap API key
