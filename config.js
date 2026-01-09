const config = {
  // Default server configuration
  server: {
    port: 4000,
    nodeEnv: "development", // 'production' or 'strict'
  },

  // Default location configuration (can be overridden by env vars)
  location: {
    latitude: 38.8977,
    longitude: -77.0365,
    name: "Washington, DC",
  },

  // Security profiles with different configurations
  security: {
    profiles: {
      development: {
        rateLimit: {
          windowMinutes: 60,
          maxRequests: 1000,
          message: "Too many requests from this IP, please try again later.",
        },
        cors: {
          enabled: true,
          origins: ["http://localhost:3000", "http://localhost:4000"],
        },
        helmet: {
          enabled: true,
        },
      },
      production: {
        rateLimit: {
          windowMinutes: 60,
          maxRequests: 100,
          message: "Too many requests from this IP, please try again later.",
        },
        cors: {
          enabled: true,
          origins: [], // Should be set via environment variables
        },
        helmet: {
          enabled: true,
        },
      },
      strict: {
        rateLimit: {
          windowMinutes: 60,
          maxRequests: 50,
          message: "Too many requests from this IP, please try again later.",
        },
        cors: {
          enabled: true,
          origins: [], // Should be set via environment variables
        },
        helmet: {
          enabled: true,
        },
      },
    },
  },
};

// Load environment variables and merge with defaults
function loadConfig() {
  require("dotenv").config();

  const securityProfile = process.env.SECURITY_PROFILE || "development";
  const profile =
    config.security.profiles[securityProfile] ||
    config.security.profiles.development;

  return {
    // API Configuration
    openWeatherKey: process.env.OPENWEATHER_KEY,

    // Server Configuration
    server: {
      port: parseInt(process.env.PORT) || config.server.port,
      nodeEnv: process.env.NODE_ENV || config.server.nodeEnv,
    },

    // Location Configuration
    location: {
      latitude: parseFloat(process.env.LATITUDE) || config.location.latitude,
      longitude: parseFloat(process.env.LONGITUDE) || config.location.longitude,
      name: process.env.LOCATION_NAME || config.location.name,
    },

    // Security Configuration
    security: {
      profile: securityProfile,
      rateLimit: {
        windowMinutes:
          parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) ||
          profile.rateLimit.windowMinutes,
        maxRequests:
          parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) ||
          profile.rateLimit.maxRequests,
        message: process.env.RATE_LIMIT_MESSAGE || profile.rateLimit.message,
      },
      cors: {
        enabled: process.env.CORS_ENABLED !== "false" && profile.cors.enabled,
        origins: process.env.CORS_ORIGIN
          ? process.env.CORS_ORIGIN === "*"
            ? "*"
            : process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
          : profile.cors.origins,
      },
      helmet: {
        enabled:
          process.env.HELMET_ENABLED !== "false" && profile.helmet.enabled,
      },
    },
  };
}

module.exports = { loadConfig, config };
