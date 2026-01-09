const path = require("path");
const fs = require("fs");

// Cache directory in /tmp for serverless environment
const CACHE_DIR = "/tmp/weather-cache";
const CACHE_FILE = path.join(CACHE_DIR, "weatherData.json");

function loadWeatherDataFromCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }
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
    throw err;
  }
}

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
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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

async function updateWeatherCache({ lat, lon }) {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const weatherData = await getWeather({ lat, lon });
    const tempFilePath = path.join(CACHE_DIR, "weatherData.temp.json");
    
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
      lastUpdated: Date.now()
    };

    const cacheData = {
      timestamp,
      location: process.env.LOCATION_NAME || "Unknown Location",
      data: weatherData
    };

    const jsonData = JSON.stringify(cacheData, null, 2);

    // Atomic write
    fs.writeFileSync(tempFilePath, jsonData);
    fs.renameSync(tempFilePath, CACHE_FILE);
    
    console.log(`✅ Weather data saved to: ${CACHE_FILE}`);
    return weatherData;
  } catch (error) {
    console.error(`❌ Error saving weather data:`, error);
    throw error;
  }
}

function simplifyWeatherData(weatherData) {
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

module.exports = async (req, res) => {
  // Validate required environment variables
  const requiredEnvVars = ["OPENWEATHER_KEY", "LATITUDE", "LONGITUDE", "LOCATION_NAME"];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
    return res.status(500).json({
      error: "Configuration error",
      message: "Missing required environment variables"
    });
  }

  const { method, url } = req;
  const pathname = new URL(url, `http://${req.headers.host}`).pathname;

  try {
    // Handle different routes
    if (method === 'GET' && pathname === '/api/') {
      // Get or refresh cache
      let weatherData = loadWeatherDataFromCache();
      
      // If no cache or cache is very old (>15 minutes), try to refresh
      if (!weatherData || 
          (weatherData.timestamp?.lastUpdated && 
           (Date.now() - weatherData.timestamp.lastUpdated) > 15 * 60 * 1000)) {
        try {
          await updateWeatherCache({ 
            lat: process.env.LATITUDE, 
            lon: process.env.LONGITUDE 
          });
          weatherData = loadWeatherDataFromCache();
        } catch (error) {
          console.error("Failed to update cache:", error);
          // Continue with stale cache if available
        }
      }
      
      if (!weatherData) {
        return res.status(503).json({
          error: "Weather data unavailable",
          message: "Weather cache is empty. Please try again in a few minutes."
        });
      }
      
      const simpleWeatherData = simplifyWeatherData(weatherData);
      res.setHeader("Content-Type", "application/json");
      return res.json(simpleWeatherData);
    }
    
    else if (method === 'GET' && pathname === '/api/full') {
      let weatherData = loadWeatherDataFromCache();
      
      // Refresh cache if needed
      if (!weatherData || 
          (weatherData.timestamp?.lastUpdated && 
           (Date.now() - weatherData.timestamp.lastUpdated) > 15 * 60 * 1000)) {
        try {
          await updateWeatherCache({ 
            lat: process.env.LATITUDE, 
            lon: process.env.LONGITUDE 
          });
          weatherData = loadWeatherDataFromCache();
        } catch (error) {
          console.error("Failed to update cache:", error);
        }
      }
      
      if (!weatherData) {
        return res.status(503).json({
          error: "Weather data unavailable",
          message: "Weather cache is empty. Please try again in a few minutes."
        });
      }
      
      res.setHeader("Content-Type", "application/json");
      return res.json(weatherData);
    }
    
    else {
      return res.status(404).json({
        error: "Not found",
        message: "API endpoint not found"
      });
    }
    
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to process weather data"
    });
  }
};