FROM node:13.7.0-alpine3.10
WORKDIR /gateway
COPY package.json /gateway
RUN npm install
COPY . /gateway
CMD npm start
EXPOSE 9080