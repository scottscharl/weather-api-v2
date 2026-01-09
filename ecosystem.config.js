module.exports = {
  apps: [{
    name: 'weather-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/weather-api/error.log',
    out_file: '/var/log/weather-api/out.log',
    log_file: '/var/log/weather-api/combined.log',
    time: true
  }]
};