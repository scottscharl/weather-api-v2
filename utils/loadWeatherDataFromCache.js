const path = require("path");
const fs = require("fs");

// Create a cache directory path relative to project root
const CACHE_DIR = path.join(__dirname, "..", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "weatherData.json");

function loadWeatherDataFromCache() {
  try {
    const data = fs.readFileSync(CACHE_FILE, "utf8");
    const cacheData = JSON.parse(data);
    
    // Validate cache age (warn if older than 10 minutes)
    if (cacheData.timestamp && cacheData.timestamp.lastUpdated) {
      const ageInMinutes = (Date.now() - cacheData.timestamp.lastUpdated) / (1000 * 60);
      if (ageInMinutes > 10) {
        console.warn(`⚠️  Weather cache is ${Math.round(ageInMinutes)} minutes old`);
      }
    }
    
    return cacheData;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("⚠️  Weather cache file does not exist");
      return null;
    }
    if (err instanceof SyntaxError) {
      console.error("❌ Weather cache file is corrupted");
      return null;
    }
    throw err; // Re-throw other errors
  }
}
module.exports = loadWeatherDataFromCache;
