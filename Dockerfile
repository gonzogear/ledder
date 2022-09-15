# syntax=docker/dockerfile:1

#FROM node:latest
FROM node:current-alpine

#build tools for alpine
RUN apk --no-cache add python3
RUN apk --no-cache add make
RUN apk --no-cache add gcc
#RUN apk add linux-headers
RUN apk --no-cache add musl-dev
RUN apk --no-cache add g++

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]


RUN NODE_ENV=development npm install

COPY . .

RUN npm run build
RUN npm run buildpreviews

CMD [ "npm", "run", "production" ]



