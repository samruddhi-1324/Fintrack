FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build

# Production server
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
