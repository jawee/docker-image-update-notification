FROM node:alpine

WORKDIR /usr/src/app

COPY ./app /usr/src/app

RUN npm install

CMD node index.js
