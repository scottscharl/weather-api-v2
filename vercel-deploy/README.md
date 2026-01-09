# Weather API - Vercel Deployment

This is the Vercel-optimized version of the weather API, converted from Express to serverless functions.

## Deployment Instructions

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   OPENWEATHER_KEY=your_api_key_here
   LATITUDE=42.49976388133817
   LONGITUDE=-83.14764182368776
   LOCATION_NAME=Royal Oak, MI
   ```

2. **Deploy to Vercel:**
   - Point Vercel to this `vercel-deploy` folder as the root directory
   - Or run: `vercel --cwd vercel-deploy`

## API Endpoints

- `GET /api/` - Simplified weather data
- `GET /api/full` - Complete weather data  
- `GET /` - Homepage with API documentation

## Features

- ✅ Serverless function compatible
- ✅ Automatic cache management (15-minute refresh)
- ✅ Error handling with proper HTTP status codes
- ✅ Environment variable validation
- ✅ Request timeout handling (10 seconds)
- ✅ Cache stored in `/tmp` for serverless environment

## Local Development

```bash
cd vercel-deploy
npm install
vercel dev
```

The API will be available at `http://localhost:3000`