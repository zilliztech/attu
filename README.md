# Attu

[![typescript](https://badges.aleen42.com/src/typescript.svg)](https://badges.aleen42.com/src/typescript.svg)
[![downloads](https://img.shields.io/docker/pulls/zilliz/attu)](https://img.shields.io/docker/pulls/zilliz/attu)
[![codecov](https://codecov.io/gh/zilliztech/attu/branch/main/graph/badge.svg?token=jvIEVF9IwW)](https://codecov.io/gh/zilliztech/attu)

Attu is an all-in-one milvus administration tool. With Attu, you can dramatically reduce the cost of managing milvus.

## screenshots

<img src="./.github/images/screenshot.png" alt="attu" width="800" alt="attu" />

## Features

- Basic dashboard
  - View basic collection statistics
  - Quick search from loaded collection
  - Quick release loaded collection
- Manage collections/partitions
  - Create collection/partion
  - Delete collection/partions
  - View collection schema
  - Create/drop index with parameters
  - Load/release collections for search
- Data Management
  - Insert entities
  - Data preview
  - Data query
- Vector search/query with advanced filter
- System view
  - View milvus nodes system info
  - View milvus nodes configuration
- Manage Milvus user
- More are comming...

## Quick start

> If you prefer desktop application, you can download the [desktop version of Attu](https://github.com/zilliztech/attu/releases/).

## Run attu from docker

> Ensure you have Milvus installed on [your server](https://milvus.io/docs/install_standalone-docker.md) or [cluster](https://milvus.io/docs/install_cluster-docker.md), and attu only supports Milvus 2.x.

> _ Before attu v2.1.0 , [check here](https://github.com/zilliztech/attu/tree/v2.0.5) _\*\*

### ✈️ Start a attu container

```code
docker run -p 8000:3000 -e MILVUS_URL={milvus server ip}:19530 zilliz/attu:latest
```

Once you start the container, open the browser, type `http://{ attu ip }:8000`, you can view the attu GUI.

#### Params

| Parameter  | Example           | required | description                 |
| :--------- | :---------------- | :------: | --------------------------- |
| MILVUS_URL | 192.168.0.1:19530 |  false   | Optional, Milvus server URL |

Tip: **127.0.0.1 or localhost will not work when runs on docker**

#### Try the dev build

**_note_** We plan to release attu once a feature is done. Also, if you want to try the nightly build, please pull the docker image with the `dev` tag.

```code
docker run -p 8000:3000 -e MILVUS_URL={ your machine IP }:19530 zilliz/attu:dev
```

## screenshots

<img src="./.github/images/screenshot.png" alt="attu" width="800" alt="attu" />
<img src="./.github/images/create_collection.png" width="800" alt="attu" />
<img src="./.github/images/create_index.png" width="800" alt="attu" />
<img src="./.github/images/data_preview.png" width="800" alt="attu" />
<img src="./.github/images/query_advanced_filter.png" width="800" alt="attu" />
<img src="./.github/images/vector_search.png" width="800" alt="attu" />

## ✨ Contributing Code

You might want to build Attu locally to contribute some code, test out the latest features, or try
out an open PR:

### Build server

1. Fork and clone the repo
2. `cd server` go to the server directory
3. `yarn install` to install dependencies
4. Create a branch for your PR

### Build client

1. Fork and clone the repo
2. `cd client` go to the client directory
3. `yarn install` to install dependencies
4. Create a branch for your PR

### Milvus

New to milvus? [Milvus](https://milvus.io) is an open-source vector database built to power AI applications and embedding similarity search.

### Userful links

- [Milvus docs](https://milvus.io/docs)
- [Milvus python sdk](https://github.com/milvus-io/pymilvus)
- [Milvus java sdk](https://github.com/milvus-io/milvus-sdk-java)
- [Milvus gp sdk](https://github.com/milvus-io/milvus-sdk-go)
- [Milvus node sdk](https://github.com/milvus-io/milvus-sdk-node)
- [Feder](https://github.com/zilliztech/feder)

#### ❓ Questions? Problems?

- If you've found a bug or want to request a feature, please create a [GitHub Issue](https://github.com/zilliztech/attu/issues/new/choose).
  Please check to make sure someone else hasn't already created an issue for the same topic.

[milvus-doc]: https://milvus.io/docs

## Community

💬 Community isn’t just about writing code together. Come join the conversation, share your knowledge and get your questions answered on [Milvus Slack Channel](https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ)!

<a href="https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ">
    <img src="https://assets.zilliz.com/readme_slack_4a07c4c92f.png" alt="Miluvs Slack Channel"  height="150" width="500">
</a>
