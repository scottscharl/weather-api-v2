const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function getWeather({ lat, lon }) {
  const baseUrl = `https://api.openweathermap.org/data/3.0/onecall?`;

  try {
    // Validate input parameters
    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);
    
    if (isNaN(numLat) || isNaN(numLon)) {
      throw new Error('Invalid coordinates: lat and lon must be valid numbers');
    }
    
    if (numLat < -90 || numLat > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
    
    if (numLon < -180 || numLon > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }

    const queryParams = [
      `lat=${encodeURIComponent(numLat)}`,
      `lon=${encodeURIComponent(numLon)}`,
      `appid=${encodeURIComponent(process.env.OPENWEATHER_KEY)}`,
      `units=imperial`,
    ].join("&");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(baseUrl + queryParams, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json();
      // Don't expose API key in error messages
      const sanitizedError = errorData.message || 'Weather service error';
      throw new Error(`Weather API error: ${res.status} - ${sanitizedError}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Weather API request timed out');
      throw new Error('Weather API request timed out');
    }
    // Log full error for debugging, but don't expose API key
    const safeMessage = error.message.replace(/appid=[^&]+/gi, 'appid=***');
    console.error("Error fetching weather data:", safeMessage);
    throw error;
  }
}

module.exports = getWeather;
