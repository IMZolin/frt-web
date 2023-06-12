FROM ubuntu:latest

RUN apt-get update && apt-get install -y nginx
RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
COPY nginx_proxy.conf /etc/nginx/sites-enabled/default
     		
CMD ["nginx"]

EXPOSE 80