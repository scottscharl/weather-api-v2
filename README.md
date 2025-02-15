# Scott's Simple Weather API

Build a simple Express API to serve up weather info. for one location.

This project uses the free tier for OpenWeatherAPI's Once Call API's free tier. You need to sign up for an API key, and then your weather server checks for new weather info every 5 mins. The data is cached so you don't exceed the One Call API's free tier limit of 1,000 requests per day.

## Quickstart

1. Generate an API key for the One Call API v3.0 at [openweather.io/api](https://openweathermap.org/api)
2. Clone this repo
3. Get the latitude & longitude coordinates for your location from [Google Maps](https://maps.google.com).
   - right-click on a place on the map
   - click on the top item "XX.xxx, XX.xxx" to copy it to clickboard
4. Add your API key, plus the coordinates, a location name, and an optional port to an .env file, like this:

```
OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # your key
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_LABEL="Washington, DC"
PORT=4000
```
