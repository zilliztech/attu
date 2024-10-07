---
id: attu_install-docker.md
label: Install with Docker Compose
order: 0
group: attu_install-docker.md
related_key: attu
summary: Learn how to install Attu with Docker Compose to manage your Milvus service.
---

{{tab}}

# Install Attu with Docker and Docker Compose

This topic describes how to install Attu with Docker Compose, an efficient open-source management tool for Milvus.

## Prerequisites

- Milvus installed on [your local device](install_standalone-docker.md) or [cluster](install_cluster-docker.md).
- Docker 19.03 or later

<div class="alert note">
Attu only supports Milvus 2.x.
</div>

## Milvus to Attu Version Mapping

| Milvus Version | Recommended Attu Version                                         |
| -------------- | ---------------------------------------------------------------- |
| 2.4.x          | [v2.4.8](https://github.com/zilliztech/attu/releases/tag/v2.4.8) |
| 2.3.x          | [v2.3.5](https://github.com/zilliztech/attu/releases/tag/v2.3.5) |
| 2.2.x          | [v2.2.8](https://github.com/zilliztech/attu/releases/tag/v2.2.8) |
| 2.1.x          | [v2.2.2](https://github.com/zilliztech/attu/releases/tag/v2.2.2) |

## Start a standalone Attu instance 

```Bash
docker run -p 8000:3000 -e HOST_URL=http://{ your machine IP }:8000 -e MILVUS_URL={your machine IP}:19530 zilliz/attu:latest
```

Once you start the docker, visit `http://{ your machine IP }:8000` in your browser, and click **Connect** to enter the Attu service.

## Start Attu with Docker Compose

Using Milvus and Attu in a docker compose environment can be quite helpful for development purposes. If you save the below into a `docker-compose.yml` file, then you can run `docker compose up` to start Milvus and Attu services. Attu will be available at `http://{ your machine IP }:8000` or `localhost:8000`. 

**Note:* Please make sure that your version of Attu is compatible with the version of Milvus that you are running. In the example below we have Milvus v2.4.12 and Attu v2.4.8.

```yaml
version: '3.5'

services:
  etcd:
    container_name: milvus-etcd
    image: quay.io/coreos/etcd:v3.5.5
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "9000:9000"
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  milvus:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.4.12
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"

  attu:
    container_name: milvus-attu
    image: zilliz/attu:2.4.8
    environment:
      MILVUS_URL: milvus:19530
    ports:
      - "8000:3000"
    depends_on:
      - "milvus"
    networks:
      - default

networks:
  default:
    name: milvus_network


```



![Attu_install](../../../../assets/attu/insight_install.png "Connect to the Attu service.")

## Contribution

Attu is an open-source project. All contributions are welcome. Please read our [Contribute guide](https://github.com/zilliztech/attu) before making contributions.

If you find a bug or want to request a new feature, please create a [GitHub Issue](https://github.com/zilliztech/attu), and make sure that the same issue has not been created by someone else.
