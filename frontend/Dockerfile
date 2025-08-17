FROM nginx:stable-alpine

# Copy our production-ready nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React files into Nginx html dir
COPY ./build /usr/share/nginx/html