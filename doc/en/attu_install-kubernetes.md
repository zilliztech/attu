---
id: attu_install-kubernetes.md
label: Install attu with Kubernetes
order: 2
group: attu
related_key: attu
summary: Learn how to install Attu with Kubernetes to manage your Milvus service.

---

# Install Attu

This topic describes how to install Attu with Kubernetes, an efficient open-source management tool for Milvus.

{{tab}}

## Prerequisites

- Milvus installed on [your local device](https://github.com/zilliztech/attu/blob/main/doc/en/install_standalone-docker.md) or [cluster](https://github.com/zilliztech/attu/blob/main/doc/en/install_cluster-docker.md).
- Kubernetes 1.16 or later
- Ingress Controllers

<div class="alert note">
Attu only supports Milvus 2.x.
</div>

## Start a Attu instance

1. Run the command to satrt a Attu instance

```shell
kubectl apply -f https://github.com/zilliztech/attu/blob/main/attu-k8s-deploy.yaml
```

2. Check the status of the running pods.

```shell
kubectl get pod
```

Get the following output:

```
NAME                                               READY   STATUS      RESTARTS   AGE
my-attu-0                                          1/1     Running     0          30s
```

3. Check the service of Attu

```shell
kubectl get svc
```

Get the following output:

```shell
NAME                          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                               AGE
my-attu-svc                   ClusterIP   10.96.0.1       <none>        3000/TCP                               40s
```

4. Connect to Attu service

Open a new terminal and run the following command to forward the local port to the port that Attu uses.

```undefined
$ kubectl port-forward service/my-attu-svc 3000
```

Visit `http://127.0.0.1:3000` in the browser, and enter the address of the Milvus service.
