# ----------------------------------------------------------------
# This Dockerfile uses multiple stages to build out the image in
# order to cut down on the final image size. To learn more about
# multistage Dockerfiles, refer to this article:
# https://docs.docker.com/develop/develop-images/multistage-build/
# ----------------------------------------------------------------

# ----------------------------------------------------------------
# BUILD STAGE
# ----------------------------------------------------------------
FROM node@sha256:676b6c3c77f7d4324d1f8dceff33e3c8b08d9089016ab59c0657852aa95f9eb7 as build
# Create a build folder to work in
COPY . /build
WORKDIR /build
# Install dependencies and run the build command
RUN npm install
RUN npm run build

# ----------------------------------------------------------------
# SERVE STAGE
# ----------------------------------------------------------------
FROM nginx:alpine as serve
# Copy the build folder from the build stage into the nginx folder
# and expose the port
COPY --from=build /build/dist /usr/share/nginx/html
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf
EXPOSE 80