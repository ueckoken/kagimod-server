FROM oven/bun:latest

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bun run build

CMD ["bun", "build/index.js"]
