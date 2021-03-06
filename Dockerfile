FROM node:12-alpine

WORKDIR /usr/src/backend

COPY . .

COPY yarn.lock .

RUN yarn

RUN yarn build

CMD [ "yarn", "startProd" ]
