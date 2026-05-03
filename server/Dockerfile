FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
