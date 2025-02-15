const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function parseWeatherData(data) {
  const currentData = data.hourly[0]; // Get current conditions
  const dailyData = data.daily; // Get daily forecast

  return {
    current: {
      temp: Math.round(currentData.temp),
      feelsLike: Math.round(currentData.feels_like),
      humidity: currentData.humidity,
      windSpeed: Math.round(currentData.wind_speed),
      conditions: currentData.weather[0].description,
      rain: currentData.rain ? currentData.rain["1h"] : 0,
    },
    daily: dailyData.map((day) => ({
      date: new Date(day.dt * 1000).toLocaleDateString(),
      high: Math.round(day.temp.max),
      low: Math.round(day.temp.min),
      conditions: day.weather[0].description,
      rain: day.rain || 0,
      snow: day.snow || 0,
    })),
  };
}
module.exports = parseWeatherData;
// Now let's create a visualization component
