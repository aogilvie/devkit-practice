FROM nginx:latest

COPY build /usr/share/nginx/html
COPY microgame/resources /usr/share/nginx/html/resources

EXPOSE 80
