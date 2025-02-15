const fs = require("fs");
const path = require("path");
const dataDir = path.join(__dirname, "../cache");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const getWeather = require("./getWeather.js");
const location = process.env("");

async function updateWeatherCache({ lat, lon }) {
  try {
    const weatherData = await getWeather({ lat, lon });
    const filePath = path.join(dataDir, "weatherData.json");
    const date = new Date(weatherData.current.dt * 1000);
    const timestamp = {
      display: new Intl.DateTimeFormat("en-US", {
        timeZone: weatherData.timezone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(date), // Thu, Feb 15, 2024, 7:34 AM EST
      iso: date.toISOString(), // 2024-02-15T12:34:56.789Z
    };

    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(
      { timestamp, location, data: weatherData },
      null,
      2
    );

    // Write to file
    fs.writeFileSync(filePath, jsonData);
    console.log(`✅ Weather data saved to: ${filePath}`);

    return weatherData;
  } catch (error) {
    console.error(`❌ Error saving weather data:`, error);
    throw error;
  }
}

// test
// updateWeatherCache();

module.exports = updateWeatherCache;
