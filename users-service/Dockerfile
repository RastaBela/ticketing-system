# 1️⃣ Utilisation de Node.js
FROM node:18

# 2️⃣ Définition du répertoire de travail
WORKDIR /app

# 3️⃣ Copier uniquement package.json et package-lock.json pour optimiser le cache Docker
COPY package*.json ./

# 4️⃣ Installer les dépendances
RUN npm install

# 5️⃣ Copier tout le projet
COPY . .

ENV DOTENV_CONFIG_PATH=/env/.env

# 6️⃣ Générer Prisma Client dans le conteneur
RUN npx prisma generate

# 7️⃣ Exposer le port utilisé par l’API
EXPOSE 5001

# 8️⃣ Commande de démarrage : attendre MySQL, appliquer Prisma, puis lancer l’API
CMD ["sh", "-c", "sleep 10 && npx prisma db push && npm run dev"]
