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
# docker run --rm -d -p 3000:3000 -p 9229:9229 --name node-vdh-api -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules -d amavm/node-vdh-api
