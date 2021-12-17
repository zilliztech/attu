---
id: attu_install-helm.md
label: Install with Helm Chart
order: 1
group: attu
related_key: attu
summary: Learn how to install Attu with Helm Chart to manage your Milvus service.
---

# 安装 Attu

本文介绍如何安装 Attu 工具。Attu 是 Milvus 的高效开源管理工具。

{{tab}}

## 先决条件

- Kubernetes 1.16 或更高版本
- Helm 3.0.0 或更高版本

<div class="alert note">
Attu 只支持 Milvus 2.x。
</div>

## 为 Milvus 安装 Helm Chart

Helm 是一个 Kubernetes 包管理器，可以帮助您快速部署 Milvus。

1. 添加 Milvus Helm 存储库。

```
$ helm repo add milvus https://milvus-io.github.io/milvus-helm/
```

2. 在本地更新图表。

```
$ helm repo update
```

## 在安装 Milvus 时安装 Attu

通过指定版本名称、图表和参数来启动 Milvus 和 Attu，这些参数表明 Attu 的安装和服务模式。本主题使用 `my-release` 作为发布名称。要使用不同的发布名称，请在命令中替换 `my-release`。

Attu 提供以下三种服务模式，您可以根据自己的场景选择其中一种。建议使用 Ingress 模式。端口转发模式建议仅在测试环境中使用。

- [Ingress 模式](#Ingress-mode)
- [LoadBalancer 模式](#LoadBalancer-mode)
- [Port-forward 模式](#Port-forward-mode)

### Ingress 模式

确保在 Kubernetes 集群中集成了 Ingress 控制器。

1. 安装 Milvus 和 Attu。

```
helm install my-release milvus/milvus --set insight.enabled=true
```

2. 检查已建立的 Ingress。

```
kubectl get ingress
```

3. 检查返回结果中对应于 `my-release-milvus-insight` 的地址。

```
NAME                          CLASS    HOSTS                  ADDRESS                               PORTS   AGE
my-release-milvus-insight    <none>   milvus-insight.local   10.100.32.1,10.100.32.2,10.100.32.3   80      22h
```

4. 通过将路径 `milvus-insight.local` 映射到系统文件 `/etc/hosts` 中返回的任何地址，在需要 Attu 服务的设备上配置 DNS。

```
10.100.32.1     milvus-insight.local
```

5. 访问 `http://milvus-insight.local`，然后单击 **Connect** 进入 Attu 服务。

![Attu_install](../assets/insight_install.png)

### LoadBalancer 模式

确保在 Kubernetes 集群中集成了 LoadBalancer。

1. 安装 Milvus and Attu。

```
helm install my-release milvus/milvus --set insight.enabled=true --set insight.service.type=LoadBalancer --set insight.ingress.enabled=false
```

2. 检查 Attu 服务。

```
kubectl get svc
```

3. 在返回的结果中检查服务 `my-release-milvus-insight` 的外部 IP。

```
NAME                                    TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)
my-release-etcd                        ClusterIP      10.96.106.84    <none>        2379/TCP,2380/TCP                     117s
my-release-etcd-headless               ClusterIP      None            <none>        2379/TCP,2380/TCP                     117s
my-release-milvus                      ClusterIP      10.96.230.238   <none>        19530/TCP,9091/TCP                    117s
my-release-milvus-datacoord            ClusterIP      10.96.75.27     <none>        13333/TCP,9091/TCP                    117s
my-release-milvus-datanode             ClusterIP      None            <none>        9091/TCP                              117s
my-release-milvus-indexcoord           ClusterIP      10.96.183.151   <none>        31000/TCP,9091/TCP                    117s
my-release-milvus-indexnode            ClusterIP      None            <none>        9091/TCP                              117s
my-release-milvus-insight              LoadBalancer   10.96.79.103    10.98.0.16    3000:30413/TCP                        117s
my-release-milvus-querycoord           ClusterIP      10.96.204.140   <none>        19531/TCP,9091/TCP                    117s
my-release-milvus-querynode            ClusterIP      None            <none>        9091/TCP                              117s
my-release-milvus-rootcoord            ClusterIP      10.96.142.19    <none>        53100/TCP,9091/TCP                    117s
my-release-minio                       ClusterIP      10.96.55.66     <none>        9000/TCP                              117s
my-release-minio-svc                   ClusterIP      None            <none>        9000/TCP                              117s
my-release-pulsar-bookkeeper           ClusterIP      None            <none>        3181/TCP                              117s
my-release-pulsar-broker               ClusterIP      10.96.177.151   <none>        8080/TCP,6650/TCP,8443/TCP,6651/TCP   117s
my-release-pulsar-proxy                ClusterIP      10.96.148.241   <none>        8080/TCP,6650/TCP,8000/TCP            117s
my-release-pulsar-zookeeper            ClusterIP      None            <none>        2888/TCP,3888/TCP,2181/TCP            117s
my-release-pulsar-zookeeper-ca         ClusterIP      10.96.100.254   <none>        2888/TCP,3888/TCP,2181/TCP            117s
```

4. 通过将路径 `my-release-milvus-insight` 映射到系统文件 `/etc/hosts` 中返回的外部 IP 上，在需要 Attu 服务的设备上配置 DNS。

```
10.98.0.16 my-release-milvus-insight
```

5. 在您的浏览器中访问 `http://my-release-milvus-insight:3000/connect`，然后单击**连接**进入 Attu 服务。

![Attu_install](../assets/insight_install.png)

### Port-forward 模式

1. 安装 Milvus 和 Attu。

```
helm install my-release milvus/milvus --set insight.enabled=true  --set insight.ingress.enabled=false
```

2. 将 Attu 服务转发到本地端口 `3000`。

```
kubectl port-forward service/my-release-milvus-insight 3000
```

3. 在转发 Attu 服务的设备上配置 DNS，将路径 `my-release-milvus-insight` 映射到系统文件 `/etc/hosts` 中的 `127.0.0.1`。

```
127.0.01 my-release-milvus-insight
```

4. 在您的浏览器中访问 `http://my-release-milvus-insight:3000/connect`，然后单击**连接**进入 Attu 服务。

![Attu_install](../assets/insight_install.png)

## 贡献

Attu 是一个开源项目。欢迎所有贡献。投稿前请先阅读我们的[投稿指南](https://github.com/zilliztech/attu)。

如果你发现一个 bug 或者想请求一个新特性，请创建一个 [GitHub Issue](https://github.com/zilliztech/attu)，并确保相同的问题没有由其他人创建。
