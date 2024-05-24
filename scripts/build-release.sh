#!/bin/sh

# login docker hub
source scripts/login.sh

# prepare environment
source scripts/prepare.sh

# Build and push Docker images with both tags
command docker buildx build \
  --platform linux/arm64,linux/amd64 \
  --tag zilliz/attu:${TAG_NAME} \
  --tag zilliz/attu:${MAJOR_MINOR} \
  --tag zilliz/attu:latest \
  --build-arg VERSION=${TAG_NAME} \
  --file Dockerfile --push .

# Remove buildx instance
command docker buildx rm multiarch
