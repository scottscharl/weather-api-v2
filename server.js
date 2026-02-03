const path = require("path");
const cron = require("node-cron");
const { loadConfig } = require("./config");

// Load configuration
const config = loadConfig();

// Validate required environment variables
if (!config.openWeatherKey) {
  console.error("❌ Missing required environment variable: OPENWEATHER_KEY");
  console.error("Please check your .env file and ensure OPENWEATHER_KEY is set.");
  process.exit(1);
}

const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
const port = config.server.port;

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Too many requests",
    message: config.rateLimit.message,
    retryAfter: config.rateLimit.windowMinutes * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// API key authentication
const apiKeyAuth = (req, res, next) => {
  if (!config.apiKey) {
    return next(); // No API key configured, allow all requests
  }

  const providedKey = req.headers['x-api-key'];
  if (providedKey === config.apiKey) {
    return next();
  }

  return res.status(401).json({
    error: "Unauthorized",
    message: "Invalid or missing API key"
  });
};

const loadWeatherDataFromCache = require("./utils/loadWeatherDataFromCache.js");
const updateWeatherCache = require("./utils/updateWeatherCache.js");
const simplifyWeatherData = require("./utils/simplifyWeatherData.js");
// Use coordinates from config
const lat = config.location.latitude;
const lon = config.location.longitude;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Initial cache update when server starts
console.log(`${new Date().toISOString()} - Running initial cache update...`);
updateWeatherCache({ lat, lon, apiKey: config.openWeatherKey }).catch((err) => {
  console.error(`${new Date().toISOString()} - Initial cache update failed:`, err);
});

// Schedule weather data cache updates every 5 min
cron.schedule("*/5 * * * *", async () => {
  console.log(`${new Date().toISOString()} - Running scheduled weather cache update...`);
  try {
    await updateWeatherCache({ lat, lon, apiKey: config.openWeatherKey });
  } catch (err) {
    console.error(`${new Date().toISOString()} - Cron job failed:`, err);
  }
});

app.get("/api/", apiKeyAuth, (_req, res) => {
  try {
    const weatherData = loadWeatherDataFromCache();

    if (!weatherData) {
      return res.status(503).json({
        error: "Weather data unavailable",
        message: "Weather cache is empty. Please try again in a few minutes."
      });
    }

    const simpleWeatherData = simplifyWeatherData(weatherData);
    res.setHeader("Content-Type", "application/json");
    res.json(simpleWeatherData);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process weather data"
    });
  }
});

app.get("/api/full", apiKeyAuth, (_req, res) => {
  try {
    const weatherData = loadWeatherDataFromCache();

    if (!weatherData) {
      return res.status(503).json({
        error: "Weather data unavailable",
        message: "Weather cache is empty. Please try again in a few minutes."
      });
    }

    res.setHeader("Content-Type", "application/json");
    res.json(weatherData);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process weather data"
    });
  }
});

app.listen(port, () => {
  console.log(`${new Date().toISOString()} - Weather API server listening on http://localhost:${port}`);
  console.log(`Location: ${config.location.name} (${lat}, ${lon})`);
  console.log(`Rate Limiting: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMinutes} minutes`);
  console.log(`API Key Auth: ${config.apiKey ? "Enabled" : "Disabled"}`);
});
