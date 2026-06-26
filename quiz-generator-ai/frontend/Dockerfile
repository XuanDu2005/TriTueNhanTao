FROM node:21-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

COPY . .

# Use npx to run vite build
RUN npx vite build


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
