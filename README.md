# Milvus insight

Milvus insight provides an intuitive and efficient GUI for Milvus, allowing you to interact with your databases and manage your data with just few clicks.

<img src="./.github/images/screenshot.png" alt="Miluvs insight" />

## Features and Roadmap
Milvus insight is under rapid development nad we are adding new features weekly, here are the current plan, we will release a version once a feature is available.
- Manage collections/partitions
- Manage index
- Basic statistics overview
- Load/release collections for search
- Insert entities
- Vector search with advanced filter
- Milvus system view(TBD)
- Data view (TBD)
- View milvus node configuration(TBD)
- Vector Visualization(TBD)
- More...

## Quick start

### Before you start

Ensure you have Milvus installed on [your server](https://milvus.io/docs/install_standalone-docker.md) or [cluster](https://milvus.io/docs/install_cluster-docker.md), and Milvus insight only supports Milvus 2.x.

### ⭐️ Start a Milvus insight instance

```code
docker run -p 8000:3000 -e HOST_URL=http://192.168.0.1:8000 -e MILVUS_URL=192.168.0.1:19530 milvusdb/milvus-insight:latest
```

Once you start the docker, open the browser, type `http://192.168.0.1:8000`, you can view the Milvus insight.

#### Params
| Parameter  | Example                 | required | description                                 |
| :--------- | :---------------------- | :------: | ------------------------------------------- |
| HOST_URL   | http://192.168.0.1:8000 |   true   | Where Milvus insight container is installed |
| MILVUS_URL | 192.168.0.1:19530       |  false   | Optional, Milvus server URL                 |

#### Try the dev build
***note*** We plan to release Milvus insight once a feature is done. Also, if you want to try the nightly build, please pull the docker image with the `dev` tag.
```code
docker run -p 8000:3000 -e HOST_URL=192.168.0.1:8000 -e MILVUS_URL=192.168.0.1:19530 milvusdb/milvus-insight:dev
```

## ✨ Building and Running Milvus insight, and/or Contributing Code

You might want to build Milvus-insight locally to contribute some code, test out the latest features, or try
out an open PR:

### Build server

1. Fork and clone the repo
2. `cd server` go to the server directory
3. `$ yarn install` to install dependencies
4. Create a branch for your PR

### Build client

1. Fork and clone the repo
2. `cd client` go to the client directory
3. `$ yarn install` to install dependencies
4. Create a branch for your PR

### Milvus

New to milvus? Milvus is an open-source vector database built to power AI applications and embedding similarity search.

### Userful links

- [Milvus installation guide](https://milvus.io/docs/v2.0.0/install_standalone-docker.md)
- [Milvus python sdk](https://milvus.io/docs/v2.0.0/explore_pymilvus.md)
- [Milvus bootcamp](https://milvus.io/bootcamp)

## Community

👉 Join the Milvus community on [Slack](https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ) to share your suggestions, advice, and questions with our engineering team.

<a href="https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ">
    <img src="https://zillizstorage.blob.core.windows.net/zilliz-assets/zilliz-assets/assets/readme_slack_4a07c4c92f.png" alt="Miluvs Slack Channel"  height="150" width="500">
</a>

#### ❓ Questions? Problems?

- If you've found a bug or want to request a feature, please create a [GitHub Issue](https://github.com/milvus-io/milvus-insight/issues/new/choose).
  Please check to make sure someone else hasn't already created an issue for the same topic.
- Need help using Milvus insight? Ask away on our [Milvus insight Discuss Forum](https://github.com/milvus-io/milvus-insight/discussions) and a fellow community member or
  Milvus engineer will be glad to help you out.

[milvus-doc]: https://milvus.io/docs/home
[nestjs]: https://docs.nestjs.com/
