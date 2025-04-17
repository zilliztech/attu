const partitionTrans = {
  create: '创建分区',
  delete: '删除分区',

  partition: '分区',

  id: 'ID',
  name: '名称',
  createdTime: '创建时间',
  status: '状态',
  rowCount: 'Entity 数量（大约）',
  tooltip: '如果该 Collection 没有加载，这个计数是一个近似值，并可能因为 Milvus 的机制而稍有延迟。实际的计数可能会有所变化，并会定期更新。请注意，这个数字仅供参考，而非精确计数。',

  createTitle: '创建分区',
  nameWarning: '_default 分区是保留的，不能用作名称',

  deleteWarning: '您正在尝试删除分区。此操作无法撤销。',
  deletePartitionError: '默认分区不能被删除',
};

export default partitionTrans;
