FROM node:20-alpine

# setup okteto message
COPY bashrc /root/.bashrc

WORKDIR /usr/src/app

ADD . .
RUN npm install

COPY . .

EXPOSE 3000

CMD npm start