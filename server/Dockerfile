FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN chmod +x docker-entrypoint.sh
EXPOSE 5000
CMD ["./docker-entrypoint.sh"]
