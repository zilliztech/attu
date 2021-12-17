---
id: attu_install-docker.md
label: Install with Docker Compose
order: 0
group: attu
related_key: attu
summary: Learn how to install Attu with Docker Compose to manage your Milvus service.
---

# 安装 Attu

这篇文章将描述如何安装 Attu - 一个开源的 MIlvus 管理工具。

{{tab}}

## 先决条件

- 已安装 Milvus [单机版](install_standalone-docker.md) 或者 [分布式版](install_cluster-docker.md)。
- Docker 版本 19.03 或者更新的版本。

<div class="alert note">
Attu 只支持 Milvus 2.x。
</div>

## 运行 Attu

```Apache
docker run -p 8000:3000 -e HOST_URL=http://{ your machine IP }:8000 -e MILVUS_URL={your machine IP}:19530 zilliz/attu:latest
```

一旦你成功运行了 Attu docker, 在浏览器输入 `http://{ your machine IP }:8000`，
然后点击 **Connect** 按钮连接 Milvus。

![Attu_install](../assets/insight_install.png)

## 欢迎成为贡献者

Attu 是一个开源项目。所有人都欢迎成为贡献者。在提交代码前，可以参考[贡献导读](https://github.com/zilliztech/attu)。

如果你发现一个 bug 或者想添加新功能，请创建一个 [GitHub Issue](https://github.com/zilliztech/attu)，同时请确认仓库中不存在类似的 issue。
