---
id: attu_install-docker.md
label: Install with Docker Compose
order: 0
group: attu
related_key: attu
summary: Learn how to install Attu with Docker Compose to manage your Milvus service.
---

# Install Attu

This topic describes how to install Attu, an efficient open-source management tool for Milvus.

{{tab}}

## Prerequisites

- Milvus installed on [your local device](install_standalone-docker.md) or [cluster](install_cluster-docker.md).
- Docker 19.03 or later

<div class="alert note">
Attu only supports Milvus 2.x.
</div>

## Start a Attu instance

```Apache
docker run -p 8000:3000 -e HOST_URL=http://{ your machine IP }:8000 -e MILVUS_URL={your machine IP}:19530 zilliz/attu:latest
```

Once you start the docker, visit `http://{ your machine IP }:8000` in your browser, and click **Connect** to enter the Attu service.

![Attu_install](../assets/insight_install.png)

## Contribution

Attu is an open-source project. All contributions are welcome. Please read our [Contribute guide](https://github.com/zilliztech/attu) before making contributions.

If you find a bug or want to request a new feature, please create a [GitHub Issue](https://github.com/zilliztech/attu), and make sure that the same issue has not been created by someone else.
