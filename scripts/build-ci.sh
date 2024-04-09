#!/bin/sh

source scripts/prepare.sh

command docker buildx build \
  --platform linux/arm64,linux/amd64 \
  --tag zilliz/attu:dev \
  --build-arg VERSION=dev \
  --file Dockerfile .

command docker buildx rm multiarch
