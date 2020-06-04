FROM node:14.4.0-alpine3.11
EXPOSE 8080

COPY *.json /
RUN npm i

COPY src /app/
RUN npm run build

CMD ["npm", "run", "prod"]