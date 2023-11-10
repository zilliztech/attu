const collectionTrans = {
  noLoadData: 'No Loaded Collection',
  noData: 'No Collection',

  rowCount: 'Approx Count',
  count: 'Entity Count',

  create: 'Collection',
  delete: 'delete',
  deleteTooltip: 'Please select at least one item to delete.',
  rename: 'rename',
  renameTooltip: 'Please select one item to rename.',
  newColName: 'New Collection Name',
  alias: 'Alias',
  aliasTooltip: 'Please select one collection to create alias',
  download: 'Download',
  downloadTooltip: 'Export all query results to CSV file',
  downloadDisabledTooltip: 'Please query data before exporting',

  collection: 'Collection',
  entities: 'entities',

  // table
  id: 'ID',
  name: 'Name',
  features: 'Features',
  nameTip: 'Collection Name',
  status: 'Status',
  desc: 'Description',
  createdTime: 'Created Time',
  maxLength: 'Max Length',
  dynmaicSchema: 'Dynamic Schema',

  // table tooltip
  aliasInfo: 'Alias can be used as collection name in vector search.',
  consistencyLevelInfo:
    'Consistency refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.',
  entityCountInfo: 'Approximately entity count.',

  // create dialog
  createTitle: 'Create Collection',
  general: 'General information',
  schema: 'Schema',
  consistency: 'Consistency',
  consistencyLevel: 'Consistency Level',
  description: 'Description',
  fieldType: 'Type',
  elementType: 'Element Type',
  vectorFieldType: 'Vector Field Type',
  fieldName: 'Field',
  idFieldName: 'Primary Key Field',
  vectorFieldName: 'Vector Field',
  autoId: 'Auto ID',
  autoIdToggleTip:
    'Whether the primary key is automatically generated by Milvus, only support INT64.',
  vectorType: 'Type',
  idType: 'Type',
  dimension: 'Dimension',
  dimensionTooltip: 'Only vector type has dimension',
  dimensionMutipleWarning: 'Dimension should be 8 multiple',
  dimensionPositiveWarning: 'Positive number only',
  newBtn: 'add new field',
  nameLengthWarning: 'Name length should be less than 256',
  nameContentWarning: 'Only numbers, letters, and underscores are allowed.',
  nameFirstLetterWarning:
    'Name first character must be underscore or character(a~z, A~Z)',
  partitionKey: 'Partition Key',
  partitionKeyTooltip:
    ' Milvus will store entities in a partition according to the values in the partition key field. Only one Int64 or VarChar field is supported.',
  enableDynamicSchema: 'Enable Dynamic Schema',

  // load dialog
  loadTitle: 'Load Collection',
  loadContent:
    'All search and query operations within Milvus are executed in memory, only loaded collection can be searched.',
  loadConfirmLabel: 'Load',
  replicaNum: 'Replica number',
  replicaDes: `With in-memory replicas, Milvus can load the same segment on multiple query nodes. The replica number can not exceed query node count.`,
  enableRepica: `Enable in-memory replica`,

  // release dialog
  releaseTitle: 'Release Collection',
  releaseContent:
    'You are trying to release a collection with data. Please be aware that the data will no longer be available for search.',
  releaseConfirmLabel: 'Release',

  // delete dialog
  deleteWarning: `You are trying to delete a collection with data. This action cannot be undone.`,
  deleteDataWarning: `You are trying to delete entities. This action cannot be undone.`,
  deleteAliasWarning: `You are trying to drop an alias. This action cannot be undone.`,

  // collection tabs
  partitionTab: 'Partitions',
  schemaTab: 'Schema',
  queryTab: 'Data Query',
  previewTab: 'Data Preview',
  segmentsTab: 'Segments',
  startTip: 'Start your data query',
  dataQuerylimits:
    ' Please note that the maximum number of results for your data query is 16384.',
  exprPlaceHolder: 'Please enter your data query, for example id > 0',

  // alias dialog
  aliasCreatePlaceholder: 'Alias name',

  // rename dialog
  newColNamePlaceholder: 'New Collection Name',
  newNameInfo: 'Only numbers, letters, and underscores are allowed.',

  // segment
  segments: 'Segments',
  segPState: 'Persistent Segment State',
  partitionID: 'Partition ID',
  segmentID: 'Segment ID',
  num_rows: 'Row Count',
  q_nodeIds: 'Query Node IDs',
  q_index_name: 'Index Name',
  q_indexID: 'Index ID',
  q_state: 'Query Segment State',
  q_mem_size: 'Memory Size',
  compact: 'Compact',
  compactDialogInfo: `Compaction is a process that optimizes storage and query performance by organizing segments.  <a href='https://milvus.io/blog/2022-2-21-compact.md' target="_blank">Learn more</a><br /><br />  Please note that this operation may take some time to complete, especially for large datasets. We recommend running compaction during periods of lower system activity or during scheduled maintenance to minimize disruption.
    `,

  // column tooltip
  autoIDTooltip: `The values of the primary key column are automatically generated by Milvus.`,
  dynamicSchemaTooltip: `Dynamic schema enables users to insert entities with new fields into a Milvus collection without modifying the existing schema.`,
  consistencyLevelTooltip: `Consistency in a distributed database specifically refers to the property that ensures every node or replica has the same view of data when writing or reading data at a given time.`,
  consistencyBoundedTooltip: `It allows data inconsistency during a certain period of time`,
  consistencyStrongTooltip: `It ensures that users can read the latest version of data.`,
  consistencySessionTooltip: `It ensures that all data writes can be immediately perceived in reads during the same session.`,
  consistencyEventuallyTooltip: `There is no guaranteed order of reads and writes, and replicas eventually converge to the same state given that no further write operations are done.`,
};

export default collectionTrans;
