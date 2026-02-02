FROM node:20-alpine

WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm install

# Copia o resto
COPY . .

# Variável para evitar estouro de memória no build (importante na Hostinger)
ENV NODE_OPTIONS="--max-old-space-size=1024"

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]