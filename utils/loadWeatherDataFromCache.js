const path = require("path");
const fs = require("fs");

// Create a cache directory path relative to project root
const CACHE_DIR = path.join(__dirname, "..", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "weatherData.json");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function loadWeatherDataFromCache() {
  try {
    const data = fs.readFileSync(CACHE_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // If file doesn't exist, return null or empty default
      return null;
    }
    throw err; // Re-throw other errors
  }
}
module.exports = loadWeatherDataFromCache;
