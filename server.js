const dotenv = require("dotenv");
const path = require("path");
const cron = require("node-cron");
dotenv.config({ path: path.resolve(__dirname, "./.env") });

// Validate required environment variables
const requiredEnvVars = ["OPENWEATHER_KEY", "LATITUDE", "LONGITUDE", "LOCATION_NAME"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
  console.error("Please check your .env file and ensure all required variables are set.");
  process.exit(1);
}

const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const { getSecurityConfig, logSecurityConfig } = require("./utils/securityConfig");

const app = express();
const port = process.env.PORT || 3000;

// Get security configuration
const securityConfig = getSecurityConfig();

// Security middleware
if (securityConfig.helmet !== false) {
  app.use(helmet(securityConfig.helmet));
}

if (securityConfig.cors !== false) {
  app.use(cors(securityConfig.cors));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: {
    error: "Too many requests",
    message: securityConfig.rateLimit.message,
    retryAfter: Math.ceil(securityConfig.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
const loadWeatherDataFromCache = require("./utils/loadWeatherDataFromCache.js");
const updateWeatherCache = require("./utils/updateWeatherCache.js");
const simplifyWeatherData = require("./utils/simplifyWeatherData.js");
const { lat, lon } = require("./data/coordinates.js");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Initial cache update when server starts
console.log(`${new Date().toISOString()} - Running initial cache update...`);
updateWeatherCache({ lat, lon }).catch((err) => {
  console.error(`${new Date().toISOString()} - Initial cache update failed:`, err);
});

// Schedule weather data cache updates every 5 min
cron.schedule("*/5 * * * *", async () => {
  console.log(`${new Date().toISOString()} - Running scheduled weather cache update...`);
  try {
    await updateWeatherCache({ lat, lon });
  } catch (err) {
    console.error(`${new Date().toISOString()} - Cron job failed:`, err);
  }
});

app.get("/api/", (_req, res) => {
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

app.get("/api/full", (_req, res) => {
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
  console.log(`Location: ${process.env.LOCATION_NAME} (${lat}, ${lon})`);
  logSecurityConfig(securityConfig);
});
