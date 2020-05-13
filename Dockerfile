FROM node:12.16.3-alpine3.11
EXPOSE 80

RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/*

COPY *.json /
RUN npm i

COPY src /app/
RUN npm run build

CMD ["npm", "run", "prod"]