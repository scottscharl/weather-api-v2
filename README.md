# Scott's Simple Weather API

Build a simple Express API to serve up weather info. for one location.

This project uses the free tier for OpenWeatherAPI's Once Call API's free tier. You need to sign up for an API key, and then your weather server checks for new weather info every 5 mins. The data is cached so you don't exceed the One Call API's free tier limit of 1,000 requests per day.

## Quickstart

1. Generate an API key for the One Call API v3.0 at [openweather.io/api](https://openweathermap.org/api)
2. Clone this repo
3. Add a .env file that contains this data:

```
OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LATITUDE=38.8977
LONGITUDE=-77.0365
LOCATION_NAME="Washington, DC"
PORT=4000

```
