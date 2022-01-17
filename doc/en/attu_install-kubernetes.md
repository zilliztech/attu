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

2. Check the established Ingress.

```shell
kubectl get ingress
```

Get the following output:

```
NAME              CLASS    HOSTS               ADDRESS                               PORTS     AGE
my-attu-ingress   <none>   my-attu.local       10.100.32.1,10.100.32.2,10.100.32.3   80        19h
```

3. Configure DNS on the device that requires the Attu service

mapping the path `my-attu.local` onto any of the addresses returned above in the system file `/etc/hosts`.

```shell
10.100.32.1  my-attu.local
```

4. Visit `http://my-attu.local` in the browser, and enter the address of the Milvus service.

