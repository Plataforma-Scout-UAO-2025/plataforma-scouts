# Stage 1: Build the React Vite application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .

RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine AS production
RUN apk --no-cache update && apk --no-cache upgrade

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]