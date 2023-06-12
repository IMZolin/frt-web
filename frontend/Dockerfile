FROM node:14-alpine

WORKDIR /app/frontend

RUN npm install --force

COPY . ./

EXPOSE 3000

CMD ["npm", "start"]