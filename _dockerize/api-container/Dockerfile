FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY *.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
# COPY . .

EXPOSE 3000

CMD npm run start:watch

# docker network create -d bridge vdh-network
# docker build -t api-container .
# docker image rm api-container
# docker run --rm -d --network vdh-network -p 3000:3000 -p 9229:9229 --name vdh-api -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules api-container

