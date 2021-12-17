---
id: attu_system.md
related_key: attu
summary: Attu, an intuitive GUI for Milvus service management.
---

# 使用 Attu 监控系统状态

此话题讨论如何使用 Attu 监控 Milvus 系统。

## 系统视图

点击左侧导航面板上的**系统视图**图标进入系统视图页面。

![系统视图](../assets/insight_system1.png)

系统视图仪表盘由以下卡片组成：

- **磁盘**： 展示存储空间占用情况。
- **内存**： 展示内存占用情况。
- **Qps**： 展示最近 10 次 QPS。每个节点代表一个时间节点。鼠标悬浮上节点可以查看时间节点上 QPS 详情。
- **延迟**: 展示最近 10 次延迟。每个节点代表一个时间节点。鼠标悬浮上节点可以查看时间节点上延迟详情。

![系统视图](../assets/insight_system2.png)
![系统视图](../assets/insight_system3.png)

- **拓扑图**： 展示当前运行 Milvus 实例系统结构。点击 Milvus 节点或者 Coordinator 节点后，右侧信息卡片会展示选中节点相关信息。
- **信息**： 展示选中节点的硬件，系统，配置信息。

## 节点列表视图

所有被同一父层 Coordinator 节点下管理的子节点都将出现在列表中。子节点可以通过 **CPU 核心数**、**CPU 内核使用**、**磁盘使用**及**内存使用**衡量指标排序。

![节点列表视图](../assets/insight_system4.png)

列表右侧是一张迷你版的拓扑图展示算中节点和父层 Coordinator 节点关系。迷你拓扑图下方是相关信息卡片。

点击向下箭头收起节点列表视图。
