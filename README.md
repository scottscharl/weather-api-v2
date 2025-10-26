# Scott's Simple Weather API

Quickly deploy an Express.js API to serve up weather data for a location you define. Your server caches the weather data for 5 minutes so you don't exceed the One Call API's free tier limit of 1,000 requests per day.

## Quickstart

1. Generate an API key for [OpenWeather's One Call API v3.0](https://openweathermap.org/api/one-call-3).

2. Clone this repo.

3. Get the latitude & longitude coordinates for your location:

   - **Option 1:** Use [LatLong.net](https://www.latlong.net/) - search for your city and copy the coordinates
   - **Option 2:** Right-click on a place in Google Maps and click the coordinates to copy

4. Add your API key, plus the coordinates, a location name, and an optional port to an `.env` file:

```env
# required
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_LABEL="Washington, DC" # any text string

OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # your OpenWeather API key
API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx # key other computers will use to access this server

# optional
PORT=4000
NODE_ENV=development # enables localhost:4000 CORS
```

**Note:** `npm start` creates an `API_KEY` in `.env` if one is not detected.

5. Deploy your server to a VPS or cloud and start building notifications and adding data and automations to your other apps and websites.

## API Endpoints

### GET `/api/`

Returns simplified weather data with essential fields only.

### GET `/api/full`

Returns complete weather data including all available fields from the cache.

## Authentication

All API endpoints require an API key. Include the `X-API-Key` header in your requests:

```bash
curl -H "X-API-Key: your-api-key" http://your-server:4000/api/
```

## Auto-Deploy Setup

See [AUTO_DEPLOY_SETUP.md](AUTO_DEPLOY_SETUP.md) for instructions on setting up automatic deployments from GitHub using cron.

## License

ISC
