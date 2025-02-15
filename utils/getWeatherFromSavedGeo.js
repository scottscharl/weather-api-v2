const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const getWeather = require("./getWeather.js");

async function getWeatherFromSavedGeo() {
  // Read and parse the home.json file
  const homeData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data/homeLocation.json"))
  );
  return await getWeather(homeData);
}

// test
// getWeather()
//   .then((data) => {
//     console.log("Weather data received:");
//     console.log(JSON.stringify(data, null, 2));
//   })
//   .catch((err) => {
//     console.error("Failed to get weather:", err);
//   });

module.exports = getWeatherFromSavedGeo;
