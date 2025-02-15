const lat = process.env.LATITUDE;
const lon = process.env.LONGITUDE;
const location = process.env.LOCATION;

if (!lat || !lon) {
  throw new Error(
    "LATITUDE and LONGITUDE must be set in environment variables. Check your .env file."
  );
}

// Optional: validate coordinates are in valid range
if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
  throw new Error(
    "Invalid coordinates: LATITUDE must be between -90 and 90, LONGITUDE between -180 and 180. Please check your .env file."
  );
}

if (!lat) {
  throw new Error("Please add a LOCATION_LABEL to your .env file.");
}

module.exports = { lat, lon, location };
