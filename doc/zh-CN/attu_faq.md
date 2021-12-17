---
id: attu_faq.md
related_key: attu
summary: Attu, an intuitive GUI for Milvus service management.
---

# Attu FAQ

#### Attu 为什么报网络错误?

答：请确认在执行 `docker run` 命令时，传入了正确的 `HOST_URL` 值。你也可以在浏览器输入 `{HOST_URL}/api/v1/healthy` 来确认 Attu 的服务状态。

#### 为什么 Attu 连接不上 Milvus？

答：请确保 Milvus 和 Attu 在同一网络。

#### 我该如何在 k8s 中使用 Attu？

答：请参考[使用 Helm Chart 安装 Attu](https://milvus.io/cn/docs/v2.0.0/attu_install-helm.md)。
