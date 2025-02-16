// middleware/auth.js
const crypto = require('crypto');

const authenticateApiKey = (req, res, next) => {
    const providedKey = req.header('X-API-Key');
    
    if (!providedKey) {
        return res.status(401).json({
            error: 'API key is required in X-API-Key header'
        });
    }

    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(providedKey),
            Buffer.from(process.env.API_KEY)
        );

        if (!isValid) {
            return res.status(401).json({
                error: 'Invalid API key'
            });
        }

        next();
    } catch (error) {
        // Handle case where API_KEY is not set
        console.error('API key validation error:', error);
        return res.status(500).json({
            error: 'API key configuration error'
        });
    }
};

module.exports = { authenticateApiKey };
