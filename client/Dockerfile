# Use Node.js for building Angular app
FROM node:20 AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source files and build the app
COPY client/ ./
RUN npm run build --prod

# Use Nginx to serve Angular
FROM nginx:alpine
COPY --from=build /app/dist/client /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
