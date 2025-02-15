const dotenv = require("dotenv");
const path = require("path");
const cron = require("node-cron");
dotenv.config({ path: path.resolve(__dirname, "./.env") });
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const loadWeatherDataFromCache = require("./utils/loadWeatherDataFromCache.js");
const updateWeatherCache = require("./utils/updateWeatherCache.js");
const simplifyWeatherData = require("./utils/simplifyWeatherData.js");
const { lat, lon } = require("./data/coordinates.js");

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

app.get("/api/", async (req, res) => {
  try {
    // get weather data by sending lat. & lon. to OpenWeatherAPI's One Call API 3.0

    const weatherData = loadWeatherDataFromCache();
    const simpleWeatherData = simplifyWeatherData(weatherData);
    res.setHeader("Content-Type", "application/json");
    res.json(simpleWeatherData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request: " + err.message);
  }
});

app.get("/api/full", async (req, res) => {
  try {
    // get weather data by sending lat. & lon. to OpenWeatherAPI's One Call API 3.0
    const weatherData = loadWeatherDataFromCache();
    res.setHeader("Content-Type", "application/json");
    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
