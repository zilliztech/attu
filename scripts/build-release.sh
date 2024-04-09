#!/bin/sh

# login docker hub
source scripts/login.sh

# prepare environment
source scripts/prepare.sh

command docker buildx build \
  --platform linux/arm64,linux/amd64 \
  --tag zilliz/attu:${TAG_NAME} \
  --tag zilliz/attu:latest \
  --build-arg VERSION=${TAG_NAME} \
  --file Dockerfile --push .

command docker buildx rm multiarch
