FROM node:24-alpine AS build

RUN apk add --no-cache \
    bash \
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
RUN yarn install --frozen-lockfile --network-timeout $YARN_TIMEOUT
COPY . .
RUN yarn build:prod

RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} +

FROM node:24-alpine AS production-dependencies

WORKDIR /var/app
ARG YARN_TIMEOUT=60000
COPY package.json yarn.lock ./
RUN yarn install \
    --frozen-lockfile \
    --production=true \
    --network-timeout $YARN_TIMEOUT \
    && yarn cache clean

FROM node:24-alpine AS runtime
ARG VERSION="1.0.0"
ENV VERSION=$VERSION
ENV NODE_ENV=prod
WORKDIR /home/node/app

RUN apk add --no-cache \
    dumb-init \
    openssl \
    postgresql18-client \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /home/node/app/storage \
    && chown -R node:node /home/node/app/storage

USER node
EXPOSE 3011
COPY --chown=node:node --from=production-dependencies /var/app/node_modules ./node_modules/
COPY --chown=node:node --from=build /var/app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=build /var/app/dist ./dist
COPY --chown=node:node --from=build /var/app/package.json ./package.json
COPY --chown=node:node --from=build /var/app/prisma ./prisma
COPY --chown=node:node --from=build /var/app/backup.sql ./backup.sql
# Templates .pug e assets de PDF: o código compilado usa __dirname em dist/
COPY --chown=node:node --from=build /var/app/src/infrastructure/providers/mail/templates ./dist/src/infrastructure/providers/mail/templates
COPY --chown=node:node --from=build /var/app/src/modules/service-order/pdf/assets ./dist/src/modules/service-order/pdf/assets
COPY --chown=node:node --from=build /var/app/.docker/entrypoint.sh ./.docker/entrypoint.sh

ENTRYPOINT ["dumb-init", "--"]
CMD ["./.docker/entrypoint.sh"]
