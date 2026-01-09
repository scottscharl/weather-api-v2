# Security Configuration Guide

This Weather API includes comprehensive security features with simple, configurable options for developers.

## 🛡️ Security Features

### Built-in Protection
- ✅ **Rate Limiting** - Prevents API abuse
- ✅ **CORS Protection** - Controls browser access
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Input Validation** - Sanitized parameters
- ✅ **Error Handling** - No sensitive data exposure

## 🔧 Quick Configuration

### Security Profiles

Choose a pre-configured security level:

```bash
# Development (default)
SECURITY_PROFILE=development

# Production (balanced)
SECURITY_PROFILE=production  

# Strict (maximum security)
SECURITY_PROFILE=strict
```

### Manual Configuration

Override any setting with environment variables:

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15    # Time window
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window

# CORS
CORS_ORIGIN="https://yoursite.com,https://app.yoursite.com"
CORS_ENABLED=true

# Security Headers
HELMET_ENABLED=true
```

## 📊 Security Profile Comparison

| Setting | Development | Production | Strict |
|---------|-------------|------------|---------|
| Rate Limit | 1000/hour | 100/15min | 50/15min |
| CORS Origins | localhost only | Must configure | Must configure |
| Security Headers | Basic | Full | Enhanced |
| Error Details | Verbose | Limited | Minimal |

## 🚀 Quick Start Examples

### Development Setup
```bash
# .env file
NODE_ENV=development
SECURITY_PROFILE=development
RATE_LIMIT_MAX_REQUESTS=1000
CORS_ORIGIN="http://localhost:3000"
```

### Production Setup
```bash
# .env file
NODE_ENV=production
SECURITY_PROFILE=production
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN="https://yourdomain.com"
```

### High-Security Setup
```bash
# .env file
NODE_ENV=production
SECURITY_PROFILE=strict
RATE_LIMIT_MAX_REQUESTS=50
CORS_ORIGIN="https://yourdomain.com"
```

## 🔍 Security Monitoring

The API logs security configuration on startup:

```
2026-01-09T17:00:00.000Z - Security Configuration:
  Rate Limiting: 100 requests per 15 minutes
  CORS: Allowed origins: https://yourdomain.com
  Security Headers: Enabled
  Security Profile: production
```

## ⚠️ Security Warnings

The system automatically warns about potential security issues:

- High rate limits in production
- Overly permissive CORS settings
- Disabled security features

## 🛠️ Advanced Configuration

### Custom Rate Limiting
```javascript
// Custom message
RATE_LIMIT_MESSAGE="API limit reached. Upgrade your plan for higher limits."

// Different windows for different endpoints
RATE_LIMIT_WINDOW_MINUTES=60
RATE_LIMIT_MAX_REQUESTS=500
```

### CORS Fine-tuning
```bash
# Multiple origins
CORS_ORIGIN="https://app1.com,https://app2.com,https://admin.com"

# Disable for server-to-server only
CORS_ENABLED=false

# Allow all (not recommended for production)
CORS_ORIGIN="*"
```

### Security Headers
```bash
# Disable all security headers (not recommended)
HELMET_ENABLED=false

# Headers are auto-configured per security profile
```

## 🚨 Security Checklist

Before deploying to production:

- [ ] Set `SECURITY_PROFILE=production` or `strict`
- [ ] Configure specific `CORS_ORIGIN` domains
- [ ] Set appropriate rate limits
- [ ] Ensure `HELMET_ENABLED=true`
- [ ] Never commit `.env` file to version control
- [ ] Use HTTPS in production
- [ ] Monitor API usage patterns
- [ ] Regularly update dependencies (`npm audit`)

## 🔐 API Key Security

The Weather API automatically:
- Validates API keys before requests
- Never logs API keys in error messages
- Encodes API keys in URL parameters
- Sanitizes error messages to prevent key exposure

## 📈 Performance Impact

Security features have minimal performance impact:
- Rate limiting: ~1ms per request
- CORS: ~0.5ms per request  
- Helmet headers: ~0.1ms per request
- Input validation: ~0.2ms per request

## 🆘 Troubleshooting

### Common Issues

**Rate Limit Hit**
```
Error 429: Too many requests
```
*Solution*: Increase `RATE_LIMIT_MAX_REQUESTS` or adjust `RATE_LIMIT_WINDOW_MINUTES`

**CORS Blocked**
```
CORS error in browser console
```
*Solution*: Add your domain to `CORS_ORIGIN`

**Security Headers Issues**
```
Content Security Policy errors
```
*Solution*: Set `HELMET_ENABLED=false` for development

### Getting Help

1. Check server startup logs for security warnings
2. Review your `.env` configuration
3. Test with `SECURITY_PROFILE=development` first
4. Gradually increase security level

## 🔄 Updates

Run security checks regularly:

```bash
npm run security-check  # Check for vulnerabilities
npm audit               # Audit dependencies
npm outdated           # Check for updates
```