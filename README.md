# Milvus insight

Milvus insight is a graphical management system for Milvus, which includes visualization of cluster state, meta management, data query and other pratical functions.

## Getting Started

Start Docker container and map the url to the container:

```code
docker run -p 9999:3000 -e URL=http://127.0.0.1:9999 -e MILVUS_URL=http://127.0.0.1:19539 milvusdb/milvus-insight:latest
```
- `URL`: the docker host url
- `MILVUS_URL`: the Milvus server url
  
Once you start the docker, open the browser, type `http://127.0.0.1:9999`, you can view the milvus insight.

## Building and Running Milvus insight, and/or Contributing Code
You might want to build Milvus-insight locally to contribute some code, test out the latest features, or try
out an open PR:

- [CONTRIBUTING.md](CONTRIBUTING.md) will help you get Milvus-insight up and running.
- If you would like to contribute code, please follow our [CONTRIBUTING.md](STYLEGUIDE.md).


## Questions? Problems? Suggestions?
- If you've found a bug or want to request a feature, please create a [GitHub Issue](https://github.com/milvus-io/milvus-insight/issues/new/choose).
  Please check to make sure someone else hasn't already created an issue for the same topic.
- Need help using Milvus insight? Ask away on our [Milvus insight Discuss Forum](https://github.com/milvus-io/milvus-insight/discussions) and a fellow community member or
Milvus engineer will be glad to help you out.


[milvus-doc]: https://milvus.io/docs/home
[Nestjs]: https://docs.nestjs.com/
