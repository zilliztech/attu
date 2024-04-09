#!/bin/sh

PACKAGE_VERSION=$(grep version package.json | awk -F \" '{print $4}')
TAG_NAME=$(git describe --tags --abbrev=0)

echo version:${PACKAGE_VERSION}
echo tag:${TAG_NAME}

command docker buildx create --use --name multiarch --driver-opt network=host --buildkitd-flags '--allow-insecure-entitlement network.host'
