import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import loadWeatherDataFromCache from "./utils/loadWeatherDataFromCache.js";
import updateWeatherCache from "./utils/updateWeatherCache.js";
import simplifyWeatherData from "./utils/simplifyWeatherData.js";
import { lat, lon } from "./data/env_variables.js";
import { authenticateApiKey } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check Node version
const nodeVersion = process.versions.node;
const [major, minor] = nodeVersion.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 6)) {
  console.error(
    `❌ Node.js 20.6.0 or higher is required. You are running ${nodeVersion}`
  );
  console.error("Please upgrade Node.js: https://nodejs.org/");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
const locationLabel = process.env.LOCATION_LABEL || "Unknown Location";

// CORS configuration with security
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : process.env.NODE_ENV === "production"
  ? []
  : ["http://localhost:3000", "http://localhost:4000"];

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS
        ? "*" // Fallback to wildcard only if no origins specified
        : (origin, callback) => {
            // Allow requests with no origin (like curl, Postman, or server-to-server)
            if (!origin) return callback(null, true);

            if (
              allowedOrigins.length === 0 ||
              allowedOrigins.includes(origin)
            ) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "X-API-Key"],
  })
);

// Check if API key is configured
if (!process.env.API_KEY) {
  console.log("Generating new API key...");
  const apiKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
  console.log("Add this to your .env file:");
  console.log(`API_KEY=${apiKey}`);
  console.log(
    "\n⚠️  WARNING: This API key is for server-to-server communication only."
  );
  console.log("Never expose it in client-side code or public repositories.\n");
  process.exit(1);
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Track last successful cache update
let lastCacheUpdate = null;
let lastCacheError = null;

// Initial cache update when server starts
console.log("Running initial cache update...");
updateWeatherCache({ lat, lon })
  .then(() => {
    lastCacheUpdate = new Date();
    console.log("✅ Initial cache update successful");
  })
  .catch((err) => {
    lastCacheError = err.message;
    console.error("❌ Initial cache update failed:", err);
  });

// Schedule weather data cache updates every 5 min
cron.schedule("*/5 * * * *", async () => {
  console.log("Running scheduled weather cache update...");
  try {
    await updateWeatherCache({ lat, lon });
    lastCacheUpdate = new Date();
    lastCacheError = null;
    console.log("✅ Scheduled cache update successful");
  } catch (err) {
    lastCacheError = err.message;
    console.error("❌ Cron job failed:", err);
  }
});

// Health check endpoint (no auth required)
app.get("/health", (req, res) => {
  const status = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    lastCacheUpdate: lastCacheUpdate ? lastCacheUpdate.toISOString() : null,
    cacheAge: lastCacheUpdate
      ? Math.floor((Date.now() - lastCacheUpdate) / 1000)
      : null,
    error: lastCacheError,
  };

  res.setHeader("Content-Type", "application/json");
  res.status(lastCacheError ? 503 : 200).json(status);
});

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add API key authentication to all /api routes
app.use("/api", authenticateApiKey);

app.get("/api/", async (req, res) => {
  try {
    // Get coordinates from query params or fall back to defaults
    const requestLat = req.query.lat ? parseFloat(req.query.lat) : lat;
    const requestLon = req.query.lon ? parseFloat(req.query.lon) : lon;

    // Validate coordinates with specific error messages
    if (req.query.lat && isNaN(requestLat)) {
      return res.status(400).json({
        error: `Invalid latitude: "${req.query.lat}" is not a valid number`,
      });
    }
    if (req.query.lon && isNaN(requestLon)) {
      return res.status(400).json({
        error: `Invalid longitude: "${req.query.lon}" is not a valid number`,
      });
    }
    if (requestLat < -90) {
      return res
        .status(400)
        .json({ error: `Latitude ${requestLat} is below minimum of -90` });
    }
    if (requestLat > 90) {
      return res
        .status(400)
        .json({ error: `Latitude ${requestLat} exceeds maximum of 90` });
    }
    if (requestLon < -180) {
      return res
        .status(400)
        .json({ error: `Longitude ${requestLon} is below minimum of -180` });
    }
    if (requestLon > 180) {
      return res
        .status(400)
        .json({ error: `Longitude ${requestLon} exceeds maximum of 180` });
    }

    // If custom coordinates are provided, fetch fresh data
    if (req.query.lat || req.query.lon) {
      console.warn(
        `⚠️  Custom coordinates requested: lat=${requestLat}, lon=${requestLon}`
      );
      console.warn(
        "⚠️  This bypasses cache and may count against API rate limits"
      );

      const weatherData = await updateWeatherCache(
        { lat: requestLat, lon: requestLon },
        false
      );
      const simpleWeatherData = simplifyWeatherData(weatherData);
      simpleWeatherData.location =
        req.query.location || `${requestLat}, ${requestLon}`;
      simpleWeatherData._warning =
        "Custom coordinates used - this request bypasses cache and may impact rate limits";
      res.setHeader("Content-Type", "application/json");
      return res.json(simpleWeatherData);
    }

    // Otherwise use cached data
    const weatherData = loadWeatherDataFromCache();
    const simpleWeatherData = simplifyWeatherData(weatherData);
    simpleWeatherData.location = locationLabel;
    res.setHeader("Content-Type", "application/json");
    res.json(simpleWeatherData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error processing request", message: err.message });
  }
});

app.get("/api/full", async (req, res) => {
  try {
    // Get coordinates from query params or fall back to defaults
    const requestLat = req.query.lat ? parseFloat(req.query.lat) : lat;
    const requestLon = req.query.lon ? parseFloat(req.query.lon) : lon;

    // Validate coordinates with specific error messages
    if (req.query.lat && isNaN(requestLat)) {
      return res.status(400).json({
        error: `Invalid latitude: "${req.query.lat}" is not a valid number`,
      });
    }
    if (req.query.lon && isNaN(requestLon)) {
      return res.status(400).json({
        error: `Invalid longitude: "${req.query.lon}" is not a valid number`,
      });
    }
    if (requestLat < -90) {
      return res
        .status(400)
        .json({ error: `Latitude ${requestLat} is below minimum of -90` });
    }
    if (requestLat > 90) {
      return res
        .status(400)
        .json({ error: `Latitude ${requestLat} exceeds maximum of 90` });
    }
    if (requestLon < -180) {
      return res
        .status(400)
        .json({ error: `Longitude ${requestLon} is below minimum of -180` });
    }
    if (requestLon > 180) {
      return res
        .status(400)
        .json({ error: `Longitude ${requestLon} exceeds maximum of 180` });
    }

    // If custom coordinates are provided, fetch fresh data
    if (req.query.lat || req.query.lon) {
      console.warn(
        `⚠️  Custom coordinates requested: lat=${requestLat}, lon=${requestLon}`
      );
      console.warn(
        "⚠️  This bypasses cache and may count against API rate limits"
      );

      const weatherData = await updateWeatherCache(
        { lat: requestLat, lon: requestLon },
        false
      );
      weatherData.location =
        req.query.location || `${requestLat}, ${requestLon}`;
      weatherData._warning =
        "Custom coordinates used - this request bypasses cache and may impact rate limits";
      res.setHeader("Content-Type", "application/json");
      return res.json(weatherData);
    }

    // Otherwise use cached data
    const weatherData = loadWeatherDataFromCache();
    weatherData.location = locationLabel;
    res.setHeader("Content-Type", "application/json");
    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error processing request", message: err.message });
  }
});

// Handle port already in use
const server = app
  .listen(port, "0.0.0.0", () => {
    console.log(`\n✅ Server listening on port ${port}`);
    console.log(
      "🔒 API endpoints are now protected with API key authentication"
    );
    console.log("📋 Include X-API-Key header in your requests");
    console.log(
      "📍 Optional: Add ?lat=VALUE&lon=VALUE query params for custom locations"
    );
    console.log(
      "⚠️  WARNING: Custom lat/lon parameters bypass cache and may exceed rate limits"
    );
    console.log(`\n🏥 Health check: http://localhost:${port}/health`);
    console.log(`📚 Documentation: http://localhost:${port}/\n`);

    if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
      console.warn(
        "⚠️  SECURITY WARNING: CORS is set to allow all origins (*)"
      );
      console.warn(
        "   Consider setting ALLOWED_ORIGINS in production for better security\n"
      );
    }
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use. Please either:`);
      console.error(`   1. Stop the process using port ${port}`);
      console.error(`   2. Set a different PORT in your .env file`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });
