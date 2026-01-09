const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function getWeather({ lat, lon }) {
  const baseUrl = `https://api.openweathermap.org/data/3.0/onecall?`;

  try {
    const queryParams = [
      `lat=${lat}`,
      `lon=${lon}`,
      `appid=${process.env.OPENWEATHER_KEY}`,
      `units=imperial`,
    ].join("&");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(baseUrl + queryParams, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Weather API error: ${res.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Weather API request timed out');
      throw new Error('Weather API request timed out');
    }
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

module.exports = getWeather;
