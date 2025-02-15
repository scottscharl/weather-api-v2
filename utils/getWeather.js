const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function getWeather({ lat, lon }) {
  // Changed to correct endpoint
  const baseUrl = `https://api.openweathermap.org/data/3.0/onecall?`;

  try {
    const queryParams = [
      `lat=${lat}`,
      `lon=${lon}`,
      `appid=${process.env.OPENWEATHER_KEY}`,
      `units=imperial`,
      // `exclude=minutely,alerts`, // Optional: exclude data we don't need
    ].join("&");

    // console.log("Making request to:", baseUrl + queryParams);
    const res = await fetch(baseUrl + queryParams);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Weather API error: ${res.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

module.exports = getWeather;
