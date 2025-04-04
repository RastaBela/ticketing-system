FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DOTENV_CONFIG_PATH=/env/.env

EXPOSE 5005

CMD ["sh", "-c", "sleep 10 && npm run dev"]
