# Scott's Simple Weather API

Quickly deploy an Express.js API to serve up weather data for a location you define.

Your server caches the weather data for 5 minutes so you don't exceed the One Call API's free tier limit of 1,000 requests per day.

`npm start` creates an `API_KEY` in `.env` if one is not detected. This will be used to authenticate requests to `/api` adn `/api/full`.

## Quickstart

1. Generate an API key for OpenWeather's [One Call API v3.0](https://openweathermap.org/api).
2. Clone this repo.
3. Get the latitude & longitude coordinates for your location from [Google Maps](https://maps.google.com).
   - Right-click on a place on the map
   - Click on the top item `XX.xxx, XX.xxx` to copy it to clickboard
4. Add your API key, plus the coordinates, a location name, and an optional port to an .env file, like this:

```
# required
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_LABEL="Washington, DC" # any text string\

OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # your OpenWeather API key
API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx # key other computers will use to access this server

# optional
PORT=4000
```

5.  Deploy your server to a VPS or cloud and starting building notifications and adding data and automations to your other apps and websites.
