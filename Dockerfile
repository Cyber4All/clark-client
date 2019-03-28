# Create image based on the official Node 8 image from dockerhub
FROM node:8 as builder

RUN mkdir -p /opt/src/app
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
ENV PATH /opt/node_modules/.bin:$PATH
WORKDIR /opt/src/app
COPY . /opt/src/app
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf ./nginx.conf
COPY --from=builder  /opt/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

