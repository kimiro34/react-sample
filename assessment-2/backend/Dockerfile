# ================================================================
# Base
# ----------------------------------------------------------------

FROM node:lts-alpine3.15
ENV NODE_ENV=production

# ================================================================
# Install DevOps tools
# ----------------------------------------------------------------

RUN apk add --update-cache --repository http://nl.alpinelinux.org/alpine/edge/testing && \
    apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache jq bash curl busybox-extras openssh-client mtr tcpdump openssl && \
    chmod u+s /bin/busybox

# ================================================================
# Plugin ODBC dependency
# ----------------------------------------------------------------

ENV ODBCINI=/src/plasticine/backend/extensions/plugins/list/plugin_odbc/configs/odbc.ini

# ================================================================
# Build
# ----------------------------------------------------------------

WORKDIR /src/plasticine/backend
COPY . .
RUN yarn install --production && yarn run extensions:install
RUN chown -R node:node /src/plasticine/backend

# TODO: resolve ansi-regex vulnerability issue in a clever way
# https://redmine.nasctech.com/issues/76270

RUN rm -rf /usr/local/lib/node_modules

# ================================================================
# Finalize
# ----------------------------------------------------------------

USER node
EXPOSE 8080
CMD [ "yarn", "run", "server:start:production" ]
