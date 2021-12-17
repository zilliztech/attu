---
id: attu_faq.md
related_key: attu
summary: Attu, an intuitive GUI for Milvus service management.
---

# Attu FAQ

#### Why is Attu throwing a network error?

A: Check whether you have assigned a correct value to `HOST_URL` in the `docker run` command. Alternatively, you can enter `{HOST_URL}/api/v1/healthy` in the address bar of your browser to check the network status of Attu.

#### Why did Attu fail to connect to Milvus?

A: Ensure that Milvus and Attu are on the same network.

#### How do I use Attu with K8s?

A: You can [install Attu while deploying Milvus with Helm](attu_install-helm.md).
