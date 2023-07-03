FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache python3 make g++ vips-dev fftw-dev build-base

# Update npm to the latest version
RUN npm install -g npm@latest

# Salin file bashrc ke dalam kontainer
COPY bashrc /root/.bashrc

# Set working directory
WORKDIR /usr/src/app

ADD . .

# Install dependensi Node.js
RUN npm install

# Salin semua file proyek ke dalam kontainer
COPY . .

# Expose port yang akan digunakan oleh aplikasi
EXPOSE 3000

# Jalankan aplikasi ketika kontainer berjalan
CMD [ "npm", "start" ]
