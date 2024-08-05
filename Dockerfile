FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

ENTRYPOINT ["npm", "run", "start:dev"]