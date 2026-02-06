FROM node:22-alpine AS build

RUN apk update && apk add curl bash && curl -sfL https://gobinaries.com/tj/node-prune | sh -s -- -b /usr/local/bin

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /var/app
ARG YARN_TIMEOUT=60000
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile --network-timeout $YARN_TIMEOUT
COPY . .
RUN yarn prisma:generate && yarn build
RUN npm prune --production

RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} +

FROM node:22-alpine AS runtime
ARG VERSION="1.0.0"
ENV VERSION $VERSION
ENV NODE_ENV prod
WORKDIR /home/node/app
RUN apk add dumb-init
RUN apk add --no-cache openssl

# Add Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER node
EXPOSE 4000
COPY --chown=node:node --from=build /var/app/node_modules ./node_modules/
COPY --chown=node:node --from=build /var/app/dist ./dist
COPY package.json prisma .docker/entrypoint.sh ./

CMD ["sh", "-c", "ls -l dist && yarn db:deploy && node dist/src/main.js"]