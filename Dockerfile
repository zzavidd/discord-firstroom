FROM node:16.13.1-alpine

WORKDIR /var/www/firstroom
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn run build

CMD yarn run start
