---
id: attu_partition.md
related_key: attu
summary: Attu, an intuitive GUI for Milvus service management.
---

# 使用 Attu 管理 Partitions

这个篇文章将描述 Attu 如何管理 partition。

Milvus 会在创建 collection 成功以后，自动创建一个默认的，不可删除的 partition。

## 创建 partition

1. 在 **Collection** 详情页面，点击 **Partitions** 页签。
2. 在 **Partitions** 页签，点击 **Create Partition** ，如下图所示，将会出现 **Create Partition** 对话框。
3. 在 **Create Partition** 对话框中，在 **Name** 输入框内，输入新的 partition 名称。
4. 点击 **Create** 按钮，创建一个 partition。

![Create Partition](../assets/insight_partition1.png)

如果创建成功，新的 partition 会出现在 **Partitions** 页面中。

![Create Partition](../assets/insight_partition2.png)

这样就可以选择任意一个 partition 来存储数据。

## 删除 partition

1. 选择需要删除的 partition。
2. 点击 **Trash** 图标，如下图所示，将会出现 **Delete Partition** 对话框。
3. 输入`delete` 确认删除操作。
4. 点击 **Delete** 删除 partition。

![Delete Partition](../assets/insight_partition3.png)
