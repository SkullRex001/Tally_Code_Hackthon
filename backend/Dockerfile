FROM node:20-alpine

# Install dependencies for node-gyp to build native modules
RUN apk add --no-cache bash python3 make g++

# Set working directory
WORKDIR /app

# Copy dependency info & install
COPY package*.json ./
RUN npm install

# Copy rest of your code
COPY . .

EXPOSE 8000
CMD ["node", "index.js"]
