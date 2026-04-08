#!/bin/bash

# Stop and remove existing containers if they exist
docker stop attu-test 2>/dev/null || true
docker rm attu-test 2>/dev/null || true

docker stop nginx-attu 2>/dev/null || true
docker rm nginx-attu 2>/dev/null || true

# Create network if it doesn't exist
docker network create attu-network 2>/dev/null || true

# Run attu container
echo "Starting attu container..."
docker run -d \
  --name attu-test \
  --network attu-network \
  -p 3000:3000 \
  -e MILVUS_ADDRESS=host.docker.internal:19530 \
  -v attu-data:/data \
  zilliz/attu:v3.0.0-beta.1

# Wait for attu to be ready
echo "Waiting for attu to be ready..."
sleep 5

# Run nginx container
echo "Starting nginx container..."
docker run -d \
  --name nginx-attu \
  --network attu-network \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:latest

echo ""
echo "Setup complete!"
echo "Attu is running at: http://localhost:3000"
echo "Attu behind nginx is running at: http://localhost:8080"
echo ""
echo "To view logs:"
echo "  docker logs -f attu-test"
echo "  docker logs -f nginx-attu"
echo ""
echo "To stop:"
echo "  docker stop attu-test nginx-attu"
echo "  docker rm attu-test nginx-attu"
