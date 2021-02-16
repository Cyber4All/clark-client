# ----------------------------------------------------------------
# This Dockerfile uses multiple stages to build out the image in
# order to cut down on the final image size. To learn more about
# multistage Dockerfiles, refer to this article:
# https://docs.docker.com/develop/develop-images/multistage-build/
# ----------------------------------------------------------------

# ----------------------------------------------------------------
# BUILD STAGE
# ----------------------------------------------------------------
FROM node:12 as build
# Create a build folder to work in
COPY . /build-tmp
WORKDIR /build-tmp
# Install dependencies and run the build command
RUN npm install && npm cache clean --force
RUN npm install -g @angular/cli@9.0.6
RUN npm run build

# ----------------------------------------------------------------
# SERVE STAGE
# ----------------------------------------------------------------
FROM nginx:alpine as serve
# Copy the build folder from the build stage into the nginx folder
# and expose the port
COPY --from=build /build-tmp/dist /usr/share/nginx/html
EXPOSE 80