FROM node:13.7.0-alpine3.10
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node app.js
# HEALTHCHECK --interval=5s --timeout=60s --start-period=5s \  
#     CMD node ./healthcheck.js
EXPOSE 8080