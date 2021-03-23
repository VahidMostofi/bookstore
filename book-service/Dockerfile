FROM node:13.7.0-alpine3.10
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
# HEALTHCHECK --interval=5s --timeout=2s --start-period=5s \  
#     CMD node ./healthcheck.js
CMD npm start
EXPOSE 3009