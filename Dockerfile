FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

RUN npx prisma generate

RUN yarn build

EXPOSE 3000


CMD ["node", "dist/main"]