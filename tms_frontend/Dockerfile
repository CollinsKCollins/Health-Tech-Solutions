# Stage 1: Build React app
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY ./package.json ./package-lock.json* ./ 
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with a lightweight server
FROM nginx:alpine

# Copy build output to nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]