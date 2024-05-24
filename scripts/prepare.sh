#!/bin/sh

PACKAGE_VERSION=$(grep version package.json | awk -F \" '{print $4}')
TAG_NAME=$(git describe --tags --abbrev=0)
# Extract major.minor from TAG_NAME
MAJOR_MINOR=$(echo $TAG_NAME | awk -F. '{print $1"."$2}')

echo version:${PACKAGE_VERSION}
echo tag:${TAG_NAME}
echo major.minor:${MAJOR_MINOR}

command docker buildx create --use --name multiarch --driver-opt network=host --buildkitd-flags '--allow-insecure-entitlement network.host'
