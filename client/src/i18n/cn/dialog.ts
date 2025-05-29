const dialogTrans = {
  value: '值',
  deleteTipAction: '输入',
  deleteTipPurpose: '以确认。',
  deleteTitle: `删除 {{type}}`,
  deleteEntityTitle: `删除 Entity`,
  renameTitle: `重命名 {{type}}`,
  releaseTitle: `释放 {{type}}`,
  duplicateTitle: `复制 {{type}}`,
  createAlias: `为 {{type}} 创建别名`,
  compact: `压缩 Collection {{type}}`,
  flush: `为 {{type}} 的数据落盘`,
  loadTitle: `加载 {{type}}`,
  editEntityTitle: `编辑 Entity`,
  modifyReplicaTitle: `修改 {{type}} 的副本`,
  editAnalyzerTitle: `编辑分析器`,
  manageMmapTitle: `管理 {{type}} 的内存映射 (mmap) 设置`,

  loadContent: `您正在尝试加载带有数据的 {{type}}。只有已加载的 {{type}} 可以被搜索。`,
  releaseContent: `您正在尝试释放带有数据的 {{type}}。请注意，数据将不再可用于搜索。`,

  createTitle: `在 "{{name}}" 上创建 {{type}}`,
  emptyTitle: `清空 {{type}} 的数据`,
  editPropertyTitle: `编辑 {{type}} 属性`,
  resetPropertyTitle: `重置 {{type}} 属性`,

  // info
  duplicateCollectionInfo:
    '复制 Collection 不会复制 Collection 中的数据。它只会使用现有的 Schema 创建一个新的 Collection。',
  flushDialogInfo: `落盘是一个在数据被插入到 Milvus 后，封闭和索引任何剩余 Segment 的过程。这避免了在未封闭的 Segment 上进行暴力搜索。<br /><br />最好在插入会话结束时使用落盘，以防止数据碎片化。<br /><br /><strong>注意：对于大型数据集，此操作可能需要一些时间。</strong>`,
  emptyDataDialogInfo: `您正在尝试清空数据。此操作无法撤销，请谨慎操作。`,
  resetPropertyInfo: '您确定要重置属性吗？',
  editEntityInfo: `注意：编辑 PrimaryKey 字段将会创建一个新的实体。`,
  editAnalyzerInfo: `分析器以 JSON 格式定义，请参考 milvus.io 了解<a href='https://milvus.io/docs/analyzer-overview.md' target='_blank'>更多信息</a>。`,
  editMmapInfo: `在 Milvus 中，内存映射文件允许将原始数据和 Index 文件直接映射到内存中。此功能提高了内存效率，特别是在可用内存稀缺但无法完全加载数据的情况下。请参考 milvus.io 了解<a href='https://milvus.io/docs/mmap.md' target='_blank'>更多信息</a>。<br /><br />注意：mmap 设置仅在加载 Collection 后生效。`,
};

export default dialogTrans;
