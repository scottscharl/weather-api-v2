const { loadConfig } = require('./config');
const loadWeatherDataFromCache = require('./utils/loadWeatherDataFromCache');
const updateWeatherCache = require('./utils/updateWeatherCache');
const simplifyWeatherData = require('./utils/simplifyWeatherData');

class WeatherAPI {
  constructor(options = {}) {
    this.config = loadConfig();
    
    // Override config with provided options
    if (options.openWeatherKey) this.config.openWeatherKey = options.openWeatherKey;
    if (options.location) Object.assign(this.config.location, options.location);
    if (options.security) Object.assign(this.config.security, options.security);
  }

  /**
   * Get simplified weather data from cache
   * @returns {Object|null} Simplified weather data or null if unavailable
   */
  getWeather() {
    const weatherData = loadWeatherDataFromCache();
    return weatherData ? simplifyWeatherData(weatherData) : null;
  }

  /**
   * Get full weather data from cache
   * @returns {Object|null} Full weather data or null if unavailable
   */
  getFullWeather() {
    return loadWeatherDataFromCache();
  }

  /**
   * Update weather cache with fresh data
   * @returns {Promise<Object>} Updated weather data
   */
  async updateCache() {
    const { latitude, longitude } = this.config.location;
    return updateWeatherCache({
      lat: latitude,
      lon: longitude,
      apiKey: this.config.openWeatherKey
    });
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Start the Express server
   * @param {Function} callback Optional callback when server starts
   * @returns {Object} Express server instance
   */
  startServer(callback) {
    // Import server module and start it
    const server = require('./server');
    if (callback) callback();
    return server;
  }
}

/**
 * Create a new WeatherAPI instance
 * @param {Object} options Configuration options
 * @returns {WeatherAPI} WeatherAPI instance
 */
function createWeatherAPI(options) {
  return new WeatherAPI(options);
}

/**
 * Quick helper to get weather data
 * @returns {Object|null} Simplified weather data
 */
function getWeather() {
  const api = new WeatherAPI();
  return api.getWeather();
}

/**
 * Quick helper to get full weather data
 * @returns {Object|null} Full weather data
 */
function getFullWeather() {
  const api = new WeatherAPI();
  return api.getFullWeather();
}

module.exports = {
  WeatherAPI,
  createWeatherAPI,
  getWeather,
  getFullWeather,
  loadConfig,
  simplifyWeatherData,
  loadWeatherDataFromCache,
  updateWeatherCache
};