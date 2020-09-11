FROM node:alpine

WORKDIR /usr/src/app

COPY ./app /usr/src/app
COPY ./package.json /usr/src/app/package.json

RUN npm install

CMD node index.js
