# Build stage for React frontend
FROM node:18-alpine as build-step
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install
RUN cd client && npm install
COPY . .
RUN cd client && npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build-step /app/client/dist ./client/dist
COPY src ./src
COPY .env.example ./.env

EXPOSE 3000
CMD ["node", "src/index.js"]
