FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]