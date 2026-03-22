# Stage 1: Build the Vite React App
FROM node:18-alpine AS build
WORKDIR /app

# Copy package info and install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx for light weight
FROM nginx:alpine
# Copy the built assets
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
