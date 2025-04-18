# => Building container
FROM --platform=$TARGETPLATFORM node:22-slim as builder
WORKDIR /app
COPY . .

ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# => Building Client
WORKDIR /app/client
RUN yarn install --network-timeout 1000000
RUN yarn build

# => Building Server
WORKDIR /app/server
RUN yarn install --network-timeout 1000000
ENV NODE_ENV production
ENV PORT 80
RUN yarn build

# => Copy to Final container
FROM --platform=$TARGETPLATFORM node:22-slim
WORKDIR /app
COPY --from=builder /app/server/dist /app/dist
COPY --from=builder /app/client/build /app/build
COPY --from=builder /app/server/package.json /app/package.json
COPY --from=builder /app/server/yarn.lock /app/yarn.lock

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# => Reinstall production dependencies and clean cache
RUN yarn install --production && yarn cache clean

# Remove git
RUN apt-get remove -y git && rm -rf /var/lib/apt/lists/*

# Make our shell script executable
RUN chmod +x /app/build/env.sh

# Make all files accessible such that the image supports arbitrary user ids
RUN chgrp -R 0 /app && \
  chmod -R g=u /app

EXPOSE 3000

# RUN echo -e window.__version="{\"version\":\""$VERSION"\"}" > /app/build/version.js
CMD [ "/bin/bash", "-c", "/app/build/env.sh && yarn start:prod" ]