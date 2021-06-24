# Milvus insight

Milvus insight provides an intuitive and efficient GUI for Milvus, allowing you to interact with your databases and manage your data with just few clicks.

<img src="../milvus-insight/.github/images/screenshot.png" alt="Miluvs insight" />

## ⭐️ Getting Started 

Start Docker container and map the url to the container:

```code
docker run -p 9999:3000 -e URL=http://127.0.0.1:9999 -e MILVUS_URL=http://127.0.0.1:19539 milvusdb/milvus-insight:latest
```
- `URL`: the docker host url
- `MILVUS_URL`: the Milvus server url
  
Once you start the docker, open the browser, type `http://127.0.0.1:9999`, you can view the milvus insight.

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


## 📖 Documentation
TBD

## Community
👉 Join the Milvus community on [Slack](https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ) to share your suggestions, advice, and questions with our engineering team. 

<a href="https://join.slack.com/t/milvusio/shared_invite/zt-e0u4qu3k-bI2GDNys3ZqX1YCJ9OM~GQ">
    <img src="https://zillizstorage.blob.core.windows.net/zilliz-assets/zilliz-assets/assets/readme_slack_4a07c4c92f.png" alt="Miluvs Slack Channel"  height="150" width="500">
</a>

### ❓ Questions? Problems?
- If you've found a bug or want to request a feature, please create a [GitHub Issue](https://github.com/milvus-io/milvus-insight/issues/new/choose).
  Please check to make sure someone else hasn't already created an issue for the same topic.
- Need help using Milvus insight? Ask away on our [Milvus insight Discuss Forum](https://github.com/milvus-io/milvus-insight/discussions) and a fellow community member or
Milvus engineer will be glad to help you out.


[milvus-doc]: https://milvus.io/docs/home
[Nestjs]: https://docs.nestjs.com/
