FROM node:16.13.1-alpine as build

WORKDIR /var/www/firstroom
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn run build

FROM node:16.13.1-alpine

WORKDIR /var/www/firstroom

COPY --from=build /var/www/firstroom/package.json .
COPY --from=build /var/www/firstroom/yarn.lock .
COPY --from=build /var/www/firstroom/dist/ ./dist/

RUN yarn install --frozen-lockfile --production

CMD yarn run start