# => Building container
FROM node:14.19-alpine3.14 as builder
WORKDIR /app
COPY . .

# => Building Client
WORKDIR /app/client
RUN yarn install
RUN yarn build
# # => Building Server
WORKDIR /app/server
RUN yarn install
ENV NODE_ENV production
ENV PORT 80
RUN yarn build

# => Copy to Final container
FROM node:14.19-alpine3.14
WORKDIR /app
COPY --from=builder /app/server/dist /app/dist
COPY --from=builder /app/client/build /app/build
# COPY --from=builder /app/server/node_modules /app/node_modules
COPY --from=builder /app/server/package.json /app/package.json
COPY --from=builder /app/server/yarn.lock /app/yarn.lock

# => Reinstall production dependencies and clean cache
RUN yarn install --production && yarn cache clean
# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x /app/build/env.sh

# Make all files accessible such that the image supports arbitrary  user ids
RUN chgrp -R 0 /app && \
  chmod -R g=u /app

EXPOSE 3000

# RUN echo -e window.__version="{\"version\":\""$VERSION"\"}" > /app/build/version.js
CMD [ "/bin/bash", "-c", "/app/build/env.sh && yarn start:prod" ]
