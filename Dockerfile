# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the working directory
# This step is done separately to leverage Docker's layer caching
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose a port if your bot were a web server (not strictly needed for a Discord bot,
# but some deployment platforms might expect it, or you might add a simple healthcheck server later)
# EXPOSE 3000

# Command to run the application
# Use 'npm start' as defined in your package.json, which runs 'node index.js'
CMD [ "npm", "start" ]
