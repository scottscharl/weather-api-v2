#!/usr/bin/env node

const { WeatherAPI } = require('../index');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Weather API CLI

Usage:
  weather-api [command] [options]

Commands:
  server     Start the weather API server
  weather    Get current weather data
  full       Get full weather data
  update     Update weather cache
  config     Show current configuration

Options:
  --help, -h    Show this help message
  --port, -p    Specify server port (for server command)

Examples:
  weather-api server
  weather-api weather
  weather-api server --port 3000
    `);
    return;
  }

  const command = args[0] || 'weather';
  
  try {
    const api = new WeatherAPI();
    
    switch (command) {
      case 'server':
        const port = args.includes('--port') || args.includes('-p') 
          ? args[args.indexOf('--port') + 1] || args[args.indexOf('-p') + 1]
          : undefined;
        
        if (port) {
          process.env.PORT = port;
        }
        
        console.log('Starting weather API server...');
        api.startServer(() => {
          console.log('✅ Weather API server started successfully');
        });
        break;
        
      case 'weather':
        const weather = api.getWeather();
        if (weather) {
          console.log(JSON.stringify(weather, null, 2));
        } else {
          console.log('❌ No weather data available. Try running "weather-api update" first.');
          process.exit(1);
        }
        break;
        
      case 'full':
        const fullWeather = api.getFullWeather();
        if (fullWeather) {
          console.log(JSON.stringify(fullWeather, null, 2));
        } else {
          console.log('❌ No weather data available. Try running "weather-api update" first.');
          process.exit(1);
        }
        break;
        
      case 'update':
        console.log('Updating weather cache...');
        await api.updateCache();
        console.log('✅ Weather cache updated successfully');
        break;
        
      case 'config':
        const config = api.getConfig();
        console.log(JSON.stringify(config, null, 2));
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        console.log('Run "weather-api --help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();