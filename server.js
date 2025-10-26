const dotenv = require("dotenv");
const path = require("path");
const cron = require("node-cron");
const crypto = require("crypto");
dotenv.config({ path: path.resolve(__dirname, "./.env") });
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const loadWeatherDataFromCache = require("./utils/loadWeatherDataFromCache.js");
const updateWeatherCache = require("./utils/updateWeatherCache.js");
const simplifyWeatherData = require("./utils/simplifyWeatherData.js");
const { lat, lon } = require("./data/env_variables.js");
const locationLabel = process.env.LOCATION_LABEL || "Unknown Location";
const { authenticateApiKey } = require("./middleware/auth");
const cors = require("cors");

app.use(
  cors({
    origin: "*", // allow all origins
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
  process.exit(1);
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Initial cache update when server starts
console.log("Running initial cache update...");
updateWeatherCache({ lat, lon }).catch((err) => {
  console.log("Initial cache update failed:", err);
});

// Schedule weather data cache updates every 5 min
cron.schedule("*/5 * * * *", async () => {
  console.log("Running scheduled weather cache update...");
  try {
    await updateWeatherCache({ lat, lon });
  } catch (err) {
    console.error("Cron job failed:", err);
  }
});

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add API key authentication to all /api routes
app.use("/api", authenticateApiKey);

app.get("/api/", async (req, res) => {
  try {
    const weatherData = loadWeatherDataFromCache();
    const simpleWeatherData = simplifyWeatherData(weatherData);
    // Add location label
    simpleWeatherData.location = locationLabel;
    res.setHeader("Content-Type", "application/json");
    res.json(simpleWeatherData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request: " + err.message);
  }
});

app.get("/api/full", async (req, res) => {
  try {
    const weatherData = loadWeatherDataFromCache();
    // Add location label
    weatherData.location = locationLabel;
    res.setHeader("Content-Type", "application/json");
    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request: " + err.message);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
  console.log("API endpoints are now protected with API key authentication");
  console.log("Include X-API-Key header in your requests");
});
