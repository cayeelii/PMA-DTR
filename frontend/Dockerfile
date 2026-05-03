# Build stage 
FROM node:20-alpine AS build
WORKDIR /app
                                                                                                                                                          
# Install dependencies first 
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# (Nginx) 
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
