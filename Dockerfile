# ========== 1) Dependencias ==========
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk update && apk upgrade
COPY package*.json ./
RUN npm ci

# ========== 2) Build ==========
FROM node:20-alpine AS build
WORKDIR /app
RUN apk update && apk upgrade
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ========== 3) Runtime ==========
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk update && apk upgrade
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

CMD ["sh", "-c", "npm run migration:run:prod && node dist/main"]
