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

2. 检查启动的 Attu pod 的运行状态

```shell
kubectl get pod
```

将获得以下输出：

```
NAME                                               READY   STATUS      RESTARTS   AGE
my-attu-0                                          1/1     Running     0          30s

```

3. 查看 Attu 服务

```shell
kubectl get svc
```

将获得以下输出：

```shell
NAME                          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                               AGE
my-attu-svc                   ClusterIP   10.96.0.1       <none>        3000/TCP                               40s
```

4. 连接 Attu 服务

打开一个新的终端，通过运行一下命令，以便在本地访问 attu 服务。

```undefined
$ kubectl port-forward service/my-attu-svc 3000
```

在浏览器中访问 `http://127.0.0.1:3000`, 在页面框中输入想要访问的 Milvus 服务地址，即可查看对应的 Milvus 服务。



