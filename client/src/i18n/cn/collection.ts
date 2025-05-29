const collectionTrans = {
  noLoadData: '没有加载的 Collection',
  noData: '没有 Collection',

  rowCount: 'Entity 数量（大约）',
  count: 'Entity 数量',

  create: '创建 Collection',
  newColName: '新的 Collection 名称',
  alias: '别名',
  aliasTooltip: '请选择一个 Collection 创建别名',
  collection: 'Collection',
  entities: 'Entities',
  mmapEnabled: '内存映射 (mmap)',
  mmapSettings: 'mmap 设置',
  collectionMMapSettingsLabel: 'Collection 级别原始数据 mmap 设置',
  rawData: '原始数据',
  functions: 'Functions',

  // table
  id: 'ID',
  name: '名称',
  features: '特性',
  nameTip: 'Collection 名称',
  status: '状态',
  desc: '描述',
  createdTime: '创建时间',
  maxLength: '最大长度',
  maxCapacity: '最大容量',
  dynamicSchema: '动态 Schema',
  function: 'Function',
  functionInput: 'Function 输入',
  functionOutput: 'Function 输出',

  // table tooltip
  aliasInfo: '别名可以在向量搜索中用作 Collection 名称。',
  consistencyLevelInfo:
    '一致性是指确保每个节点或副本在给定时间写入或读取数据时具有相同数据视图的属性。',
  entityCountInfo:
    '如果该 Collection 没有加载，这个计数是一个近似值，并可能因为 Milvus 的机制而稍有延迟。实际的计数可能会有所变化，并会定期更新。请注意，这个数字仅供参考，而非精确计数。',
  replicaTooltip: 'Collection 的副本数量，不能超过查询节点的数量。',
  modifyReplicaTooltip: '调整副本数量',

  // create dialog
  createTitle: '创建 Collection {{name}}',
  idAndVectorFields: 'ID、向量字段',
  scalarFields: '标量字段',
  schema: 'Schema',
  consistency: '一致性',
  consistencyLevel: '一致性级别',
  description: '描述',
  fieldType: '类型',
  elementType: '数组类型',
  vectorFieldType: '向量字段类型',
  fieldName: '字段',
  idFieldName: '主键字段',
  vectorFieldName: '向量字段',
  autoId: '自动 ID',
  autoIdToggleTip: '主键是否由 Milvus 自动生成，仅支持 INT64。',
  vectorType: '类型',
  idType: '类型',
  dimension: '维度',
  dimensionTooltip: '只有向量类型有维度',
  dimensionMultipleWarning: '维度应为 8 的倍数',
  dimensionPositiveWarning: '只能是正数',
  newBtn: '添加新字段',
  nameLengthWarning: '名称长度应小于 256',
  nameContentWarning: '只允许数字、字母和下划线。',
  nameFirstLetterWarning: '名称的第一个字符必须是下划线或字母 (a~z, A~Z)',
  partitionKey: '分区键',
  partitionKeyTooltip:
    'Milvus 将根据分区键字段中的值在分区中存储 Entities。只支持一个 Int64 或 VarChar 字段。',
  paritionKeyDisabledTooltip:
    '只允许一个分区字段，同时分区键字段不能用作主键字段。',
  enableDynamicSchema: '启用动态 Schema',
  analyzer: '分词器',
  enableMatch: '启用匹配',
  textMatchTooltip: 'Milvus 中的文本匹配能够基于特定术语实现精确的文档检索。',
  nullable: 'Nullable',
  nullableTooltip: '字段是否可以为 null，Nullable 字段不能用作分区键。',
  defaultValue: '默认值',
  defaultValueTooltip: '字段的默认值，不支持 JSON 和 Array。',
  loadCollectionAfterCreate: '创建后加载 Collection',
  loadCollectionAfterCreateTooltip:
    'Attu 将使用 AUTOINDEX 为所有字段创建 Index，然后加载 Collection。',
  addBm25Function: '添加 BM25 Function',
  bm25NoVarcharAndSparse: '要创建 BM25 Function，请至少添加一个 VarChar 字段和一个 SparseFloatVector 字段。',
  bm25NoVarchar: '要创建 BM25 Function，请至少添加一个 VarChar 字段。',
  bm25NoSparse: '要创建 BM25 Function，请至少添加一个 SparseFloatVector 字段。',
  bm25InputVarChar: '输入 VarChar 字段',
  bm25OutputSparse: '输出 SparseFloatVector 字段',
  noAvailableSparse: '没有可用的字段',

  // load dialog
  loadTitle: '加载 Collection',
  loadContent:
    'Milvus 中的所有搜索和查询操作都在内存中执行，只有加载的 Collection 可以被搜索。',
  loadConfirmLabel: '加载',
  replica: '副本',
  replicaNum: '副本数量',
  replicaDes: `有了内存副本，Milvus 可以在多个查询节点上加载相同的 Segment。副本数量不能超过查询节点数量。`,
  enableRepica: `启用内存副本`,

  // release dialog
  releaseTitle: '释放 Collection',
  releaseContent:
    '你正在试图释放一个带有数据的 Collection。请注意，数据将不再可用于搜索。',
  releaseConfirmLabel: '释放',

  // delete dialog
  deleteWarning: `你正在试图删除一个带有数据的 Collection。此操作无法撤销。`,
  deleteDataWarning: `你正在试图删除 Entities。此操作无法撤销。`,
  deleteAliasWarning: `你正在试图删除一个别名。此操作无法撤销。`,

  // collection tabs
  partitionTab: '分区',
  overviewTab: '概览',
  schemaTab: 'Schema',
  searchTab: '向量搜索',
  dataTab: '数据',
  previewTab: '数据预览',
  segmentsTab: 'Segment',
  propertiesTab: '属性',
  startTip: '开始你的数据查询',
  exprPlaceHolder: '请输入你的查询表达式，例如 id > 0',
  queryExpression: '查询表达式',

  // alias dialog
  aliasCreatePlaceholder: '别名',

  // rename dialog
  newColNamePlaceholder: '新的 Collection 名称',
  newNameInfo: '只允许数字、字母和下划线。',

  // duplicate dialog
  duplicateNameExist: 'Collection 已经存在。',
  fieldNameExist: '字段名称已存在。',

  // segment
  segments: 'Segment',
  segPState: '持久 Segment 状态',
  partitionID: '分区 ID',
  segmentID: 'Segment ID',
  num_rows: '行数',
  q_nodeIds: '查询节点 IDs',
  q_index_name: 'Index 名称',
  q_indexID: 'Index ID',
  q_state: '查询 Segment 状态',
  q_mem_size: '内存大小',
  compact: '压缩',
  compactDialogInfo:
    "压缩是通过组织 Segment 来优化存储和查询性能的过程。<a href='https://milvus.io/blog/2022-2-21-compact.md' target='blank'>了解更多</a><br /><br />请注意，这个操作可能需要一些时间来完成，特别是对于大型数据集。建议在系统活动较低的时期或在计划的维护期间运行压缩以最小化干扰。",

  // column tooltip
  dynamicSchemaTooltip:
    '动态 Schema 使用户能够在不修改现有 Schema 的情况下向 Milvus Collection 插入带有新字段的 Entities。',
  consistencyBoundedTooltip: '允许在一定时间内数据不一致。',
  consistencyStrongTooltip: '确保用户可以读取数据的最新版本。',
  consistencySessionTooltip:
    '确保在同一会话中所有数据写入可以立即在读取中感知。',
  consistencyEventuallyTooltip:
    '不保证读写的顺序，副本最终会在没有进一步写操作的情况下收敛到相同的状态。',
  noVectorIndexTooltip: '请保证所有向量列都有索引。',
  mmapTooltip: `内存映射文件允许将原始数据和 Index 文件直接映射到内存中。此功能提高了内存效率，尤其是在可用内存稀缺但无法完全加载数据的情况下。`,
  mmapFieldSettingDisabledTooltip: `此设置已禁用，因为 Collection 级别的 mmap 配置覆盖了字段级别的设置。`,
  mmapCollectionNotReleasedTooltip: `Collection 没有释放，无法更新 mmap 配置。`,

  clickToLoad: '点击加载 Collection',
  clickToRelease: '点击释放 Collection',
  clickToSearch: '点击执行向量搜索',
  clickToCreateVectorIndex: '点击创建向量索引',
  collectionIsLoading: 'Collection 正在加载...',
};

export default collectionTrans;
