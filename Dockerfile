FROM node:20

WORKDIR /user-details

COPY package.json package-lock.json ./
RUN npm install

COPY src/ ./src

COPY . .

CMD ["npx", "ts-node", "./src/app.ts"]

EXPOSE 4899