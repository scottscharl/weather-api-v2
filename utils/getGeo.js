const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const Geocodio = require("geocodio-library-node");
const geocoder = new Geocodio(process.env.GEOCODIO_KEY);

async function getGeo(address) {
  try {
    const response = await geocoder.geocode(address);
    const { location } = response.results[0];
    // console.log({ address, location });
    return { address, lat: location.lat, lon: location.lng };
  } catch (err) {
    // console.log({ address });
    console.error(err);

    throw err;
  }
}

module.exports = getGeo;
