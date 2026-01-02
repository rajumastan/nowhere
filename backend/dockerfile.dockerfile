FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]