const config = {
  // Default server configuration
  server: {
    port: 4000,
  },

  // Default location configuration (can be overridden by env vars)
  location: {
    latitude: 38.8977,
    longitude: -77.0365,
    name: "Washington, DC",
  },

  // Rate limiting defaults
  rateLimit: {
    windowMinutes: 60,
    maxRequests: 100,
    message: "Too many requests from this IP, please try again later.",
  },
};

// Load environment variables and merge with defaults
function loadConfig() {
  require("dotenv").config();

  return {
    // API Configuration
    openWeatherKey: process.env.OPENWEATHER_KEY,
    apiKey: process.env.API_KEY,

    // Server Configuration
    server: {
      port: parseInt(process.env.PORT) || config.server.port,
    },

    // Location Configuration
    location: {
      latitude: parseFloat(process.env.LATITUDE) || config.location.latitude,
      longitude: parseFloat(process.env.LONGITUDE) || config.location.longitude,
      name: process.env.LOCATION_NAME || config.location.name,
    },

    // Rate Limiting Configuration
    rateLimit: {
      windowMinutes:
        parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) ||
        config.rateLimit.windowMinutes,
      maxRequests:
        parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
        config.rateLimit.maxRequests,
      message: process.env.RATE_LIMIT_MESSAGE || config.rateLimit.message,
    },
  };
}

module.exports = { loadConfig, config };
