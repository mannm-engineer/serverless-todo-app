FROM --platform=linux/amd64 node:14-alpine
## Create app directory
WORKDIR /usr/src/app
## Install app dependencies
## A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./
RUN npm install
## Bundle app source
COPY . .
# Build the React application for production
RUN npm run build
# Expose the port the application will run on
EXPOSE 3000
# Define the command to start the application
CMD ["npm", "start"]
