const loadWeatherDataFromCache = require("./loadWeatherDataFromCache");

function simplifyWeatherData(weatherData) {
  // Extract essential and additional data from the input
  const processedWeatherData = {
    lat: weatherData.data.lat,
    lon: weatherData.data.lon,
    timezone: weatherData.data.timezone,
    timezone_offset: weatherData.data.timezone_offset,
    current: {
      dt: weatherData.data.current.dt,
      sunrise: weatherData.data.current.sunrise,
      sunset: weatherData.data.current.sunset,
      temp: weatherData.data.current.temp,
      feels_like: weatherData.data.current.feels_like,
      pressure: weatherData.data.current.pressure,
      humidity: weatherData.data.current.humidity,
      dew_point: weatherData.data.current.dew_point,
      uvi: weatherData.data.current.uvi,
      clouds: weatherData.data.current.clouds,
      visibility: weatherData.data.current.visibility,
      wind_speed: weatherData.data.current.wind_speed,
      wind_deg: weatherData.data.current.wind_deg,
      weather: weatherData.data.current.weather[0],
      // rain: weatherData.data.current.rain
      //   ? weatherData.data.current.rain["1h"]
      //   : 0,
      // snow: weatherData.data.current.snow
      //   ? weatherData.data.current.snow["1h"]
      //   : 0,
    },
    alerts: weatherData.data.alerts
      ? weatherData.data.alerts.map((alert) => ({
          event: alert.event,
          description: alert.description,
          start: new Date(alert.start * 1000).toLocaleString(),
          end: new Date(alert.end * 1000).toLocaleString(),
        }))
      : [],
  };

  return { timestamp: weatherData.timestamp, data: processedWeatherData };
}

module.exports = simplifyWeatherData;
