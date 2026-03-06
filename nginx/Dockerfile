FROM nginx:alpine

ARG CONF_FILE=nginx.conf

RUN rm /etc/nginx/conf.d/default.conf

COPY ${CONF_FILE} /etc/nginx/conf.d/app.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
