FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production 

# Copy app source
COPY . .

# Expose port (adjust if your app uses a different port)
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
