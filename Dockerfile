FROM node:12.16.3-alpine3.11
EXPOSE 8080

COPY *.json /
RUN npm i

COPY src /app/
RUN npm run build

CMD ["npm", "run", "prod"]