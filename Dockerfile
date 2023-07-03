FROM node:20-alpine

# Instal dependensi Python, make, dan g++
RUN apk add --no-cache python3 make g++

# setup okteto message
COPY bashrc /root/.bashrc

WORKDIR /usr/src/app

ADD . .

RUN npm install

COPY . .

EXPOSE 3000

CMD npm start