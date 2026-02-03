FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the default port
EXPOSE 4000

# Run the server
CMD ["npm", "start"]
