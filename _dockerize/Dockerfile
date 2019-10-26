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

# docker build -t amavm/node-vdh-api .
# docker image rm amavm/node-vdh-api
# docker run -p 1234:3000 --name node-vdh-api -v "$(pwd)/src":/usr/src/app/src -d amavm/node-vdh-api
