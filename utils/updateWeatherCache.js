const fs = require("fs");
const path = require("path");
const getWeatherFromSavedGeo = require("./getWeatherFromSavedGeo.js");
const dataDir = path.join(__dirname, "../cache");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

async function updateWeatherCache() {
  try {
    const weatherData = await getWeatherFromSavedGeo();
    const filePath = path.join(dataDir, "weatherData.json");
    const timestamp = new Date(weatherData.current.dt * 1000).toLocaleString();

    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify({ timestamp, data: weatherData }, null, 2);

    // Write to file
    fs.writeFileSync(filePath, jsonData);
    console.log("Weather data saved to:", filePath);

    return weatherData;
  } catch (error) {
    console.error(`Error saving weather data:`, error);
    throw error;
  }
}

// test
// updateWeatherCache();

module.exports = updateWeatherCache;
