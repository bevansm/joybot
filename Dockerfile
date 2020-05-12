FROM node:12.16.3-alpine3.11
EXPOSE 8080

COPY dist /app/
CMD ["node app/index.js"]