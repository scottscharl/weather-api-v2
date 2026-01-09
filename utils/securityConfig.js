// Security configuration module with smart defaults and presets

const securityPresets = {
  development: {
    rateLimit: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 1000, // Very generous for development
      message: "Too many requests from this IP, please try again later.",
    },
    cors: {
      origin: ["http://localhost:3000", "http://localhost:4000", "http://127.0.0.1:3000"],
      credentials: true
    },
    helmet: {
      contentSecurityPolicy: false, // Disable for easier development
    }
  },
  
  production: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Standard limit for production
      message: "Too many requests from this IP, please try again later.",
    },
    cors: {
      origin: false, // Must be configured explicitly
      credentials: true
    },
    helmet: {} // Use all default security headers
  },
  
  strict: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // Conservative limit
      message: "Rate limit exceeded. Please try again later.",
    },
    cors: {
      origin: false, // Must be configured explicitly
      credentials: false // No credentials in strict mode
    },
    helmet: {
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  }
};

function getSecurityConfig() {
  const env = process.env.NODE_ENV || 'development';
  const securityProfile = process.env.SECURITY_PROFILE || env;
  
  // Start with preset
  let config = JSON.parse(JSON.stringify(securityPresets[securityProfile] || securityPresets.development));
  
  // Allow environment variable overrides
  if (process.env.RATE_LIMIT_WINDOW_MINUTES) {
    config.rateLimit.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000;
  }
  
  if (process.env.RATE_LIMIT_MAX_REQUESTS) {
    config.rateLimit.max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS);
  }
  
  if (process.env.RATE_LIMIT_MESSAGE) {
    config.rateLimit.message = process.env.RATE_LIMIT_MESSAGE;
  }
  
  if (process.env.CORS_ORIGIN) {
    if (process.env.CORS_ORIGIN === 'false') {
      config.cors.origin = false;
    } else if (process.env.CORS_ORIGIN === '*') {
      config.cors.origin = true; // Allow all origins
    } else {
      // Split comma-separated origins
      config.cors.origin = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    }
  }
  
  if (process.env.CORS_ENABLED === 'false') {
    config.cors = false; // Disable CORS entirely
  }
  
  if (process.env.HELMET_ENABLED === 'false') {
    config.helmet = false; // Disable Helmet entirely
  }
  
  return config;
}

function validateSecurityConfig(config) {
  const warnings = [];
  
  // Check rate limiting
  if (config.rateLimit.max > 500) {
    warnings.push('⚠️  High rate limit detected. Consider lowering for production.');
  }
  
  // Check CORS configuration
  if (config.cors && config.cors.origin === true) {
    warnings.push('⚠️  CORS allows all origins. This may be insecure in production.');
  }
  
  if (config.cors === false && process.env.NODE_ENV === 'production') {
    warnings.push('⚠️  CORS is disabled in production. This may cause browser issues.');
  }
  
  return warnings;
}

function logSecurityConfig(config) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - Security Configuration:`);
  
  // Rate limiting info
  const windowMinutes = config.rateLimit.windowMs / (1000 * 60);
  console.log(`  Rate Limiting: ${config.rateLimit.max} requests per ${windowMinutes} minutes`);
  
  // CORS info
  if (config.cors === false) {
    console.log(`  CORS: Disabled`);
  } else if (config.cors.origin === true) {
    console.log(`  CORS: All origins allowed`);
  } else if (config.cors.origin === false) {
    console.log(`  CORS: Same-origin only`);
  } else if (Array.isArray(config.cors.origin)) {
    console.log(`  CORS: Allowed origins: ${config.cors.origin.join(', ')}`);
  }
  
  // Helmet info
  console.log(`  Security Headers: ${config.helmet === false ? 'Disabled' : 'Enabled'}`);
  
  // Security profile
  const profile = process.env.SECURITY_PROFILE || process.env.NODE_ENV || 'development';
  console.log(`  Security Profile: ${profile}`);
  
  // Show warnings
  const warnings = validateSecurityConfig(config);
  if (warnings.length > 0) {
    console.log(`  Security Warnings:`);
    warnings.forEach(warning => console.log(`    ${warning}`));
  }
}

module.exports = {
  getSecurityConfig,
  validateSecurityConfig,
  logSecurityConfig,
  securityPresets
};