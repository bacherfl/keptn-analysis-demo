# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the backend application files to the working directory
COPY . .

# Expose the port on which your backend application will run
EXPOSE 5000

# Command to run your backend application
CMD ["node", "server.js"]  # Replace "server.js" with your backend entry file
