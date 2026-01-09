const fs = require("fs");
const path = require("path");

// Secure cache directory setup
const dataDir = path.resolve(__dirname, "../cache");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
}

// Validate cache directory is within project bounds
const projectRoot = path.resolve(__dirname, "..");
if (!dataDir.startsWith(projectRoot)) {
  throw new Error("Cache directory path traversal detected");
}
const getWeather = require("./getWeather.js");
const location = process.env.LOCATION_NAME;

async function updateWeatherCache({ lat, lon }) {
  try {
    const weatherData = await getWeather({ lat, lon });
    const filePath = path.join(dataDir, "weatherData.json");
    const tempFilePath = path.join(dataDir, "weatherData.temp.json");
    
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
      }).format(date),
      iso: date.toISOString(),
      lastUpdated: Date.now() // Add timestamp for cache age validation
    };

    const cacheData = {
      timestamp,
      location: location || "Unknown Location",
      data: weatherData
    };

    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(cacheData, null, 2);

    // Atomic write: write to temp file first, then rename
    fs.writeFileSync(tempFilePath, jsonData);
    fs.renameSync(tempFilePath, filePath);
    
    console.log(`✅ Weather data saved to: ${filePath}`);
    return weatherData;
  } catch (error) {
    console.error(`❌ Error saving weather data:`, error);
    throw error;
  }
}


module.exports = updateWeatherCache;
