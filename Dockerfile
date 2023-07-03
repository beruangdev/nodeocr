FROM node:20-alpine

# Instal dependensi Python, make, dan g++
RUN apk add --no-cache python3 make g++

# Salin file bashrc ke dalam kontainer
COPY bashrc /root/.bashrc

# Set working directory
WORKDIR /usr/src/app

# Salin semua file proyek ke dalam kontainer
COPY . .

# Install dependensi Node.js
RUN npm install

# Expose port yang akan digunakan oleh aplikasi
EXPOSE 3000

# Jalankan aplikasi ketika kontainer berjalan
CMD [ "npm", "start" ]
