# ----------------------------------------------------------------
# BUILD STAGE
# ----------------------------------------------------------------
    FROM node:18.0.0 AS build

    COPY . /build
    # Install system dependencies for building native modules
    RUN apt-get update && apt-get install -y \
        build-essential \
        libcairo2-dev \
        libpango1.0-dev \
        libjpeg-dev \
        libgif-dev \
        librsvg2-dev \
        python3 \
        && apt-get clean
    
    # Set the working directory
    WORKDIR /build
    
    # Copy application files
    COPY package.json package-lock.json ./
    
    # Install dependencies
    RUN npm install --build-from-source=false
    
    # Copy the rest of the application files
    COPY . .
    
    # Build the application
    RUN npm run build
    
    # ----------------------------------------------------------------
    # SERVE STAGE
    # ----------------------------------------------------------------
    FROM nginx:alpine AS serve
    
    # Copy built files from the build stage
    COPY --from=build /build/dist /usr/share/nginx/html
    
    # Copy a custom nginx configuration file if needed
    COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

    EXPOSE 80
    