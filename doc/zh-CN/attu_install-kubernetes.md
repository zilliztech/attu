---
id: attu_install-kubernetes.md
label: Install attu with Kubernetes
order: 2
group: attu
related_key: attu
summary: Learn how to install Attu with Kubernetes to manage your Milvus service.
---

# 安装 Attu

这篇文章将描述如何在 Kubernetes 上安装 Attu - 一个开源的 MIlvus 管理工具。

{{tab}}

## 先决条件

- 已安装 Milvus [单机版](install_standalone-docker.md) 或者 [分布式版](install_cluster-docker.md)。
- Kubernetes 1.16 或更高版本
- Ingress 控制器

<div class="alert note">
Attu 只支持 Milvus 2.x。
</div>

## 启动 Attu

1. 运行以下命令启动 attu

```shell
kubectl apply -f https://github.com/zilliztech/attu/blob/main/attu-k8s-deploy.yaml
```



2. 检查启动的 ingress 资源

```shell
kubectl get ingress
```

将获得以下输出：

```
NAME              CLASS    HOSTS               ADDRESS                               PORTS     AGE
my-attu-ingress   <none>   my-attu.local       10.100.32.1,10.100.32.2,10.100.32.3   80        19h

```



3. 在需要访问 attu 服务的机器上配置 DNS

在系统文件 `/etc/hosts` 中将路径 `my-attu.local` 映射为上述输出中 my-attu-ingress 对应的 ADDRESS 中的任意一地址。

```shell
10.100.32.1  my-attu.local
```



4. 在浏览器中访问 `http://my-attu.local`, 在页面框中输入想要访问的 Milvus 服务地址，即可查看对应的 Milvus 服务。



