const fs = require("fs");
const getGeo = require("./getGeo.js");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const address =
  process.env.DEFAULT_ADDRESS ||
  "1600 Pennsylvania Ave NW, Washington, DC 20500";

// Make sure the data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

async function saveGeo(address) {
  try {
    const geoData = await getGeo(address);
    const filePath = path.join(dataDir, "homeLocation.json");

    // Convert to JSON string with pretty formatting
    const jsonData = JSON.stringify(geoData, null, 2);

    // Write to file
    fs.writeFileSync(filePath, jsonData);
    console.log("Geocoding data saved to:", filePath);

    return geoData;
  } catch (error) {
    console.error("Error saving geocoding data:", error);
    throw error;
  }
}

// Example usage:
// saveGeo(address);

module.exports = saveGeo;
