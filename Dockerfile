# Create image based on the official Node 6 image from dockerhub
FROM node:8

# Create a directory where our app will be placed
RUN mkdir -p /opt/src/app

# Expose the port the app runs in and the webpack server port
EXPOSE 4200 49153

# install dependencies in a different location for easier app bind mounting for local development
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
RUN npm install -g @angular/cli@7.3.9
ENV PATH /opt/node_modules/.bin:$PATH

# Copy source to the app's directory
WORKDIR /opt/src/app
COPY . /opt/src/app

# Serve the app
CMD ng serve --host 0.0.0.0