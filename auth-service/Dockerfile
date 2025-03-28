FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DOTENV_CONFIG_PATH=/env/.env

RUN npx prisma generate

EXPOSE 5002

CMD ["sh", "-c", "sleep 10 && npx prisma db push && npm run dev"]