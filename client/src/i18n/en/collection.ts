const collectionTrans = {
  noLoadData: 'No Loaded Collection',
  noData: 'No Collection',

  rowCount: 'Entity Count',
  tooltip: 'Approximately entity count.',

  create: 'Create Collection',
  delete: 'delete',
  deleteTooltip: 'Please select at least one item to delete.',
  alias: 'alias',
  aliasTooltip: 'Please select one collection to create alias',
  download: 'Download',
  downloadTooltip: 'Download all query results',

  collection: 'Collection',
  entites: 'entites',

  // table
  id: 'ID',
  name: 'Name',
  nameTip: 'Collection Name',
  status: 'Status',
  desc: 'Description',
  createdTime: 'Created Time',
  maxLength: 'Max Length',

  // create dialog
  createTitle: 'Create Collection',
  general: 'General information',
  schema: 'Schema',
  consistency: 'Consistency Level',
  consistencyLevel: 'Consistency Level',
  description: 'Description',
  fieldType: 'Field Type',
  vectorFieldType: 'Vector Field Type',
  fieldName: 'Field Name',
  idFieldName: 'ID Name',
  vectorFieldName: 'Vector Name',
  autoId: 'Auto ID',
  vectorType: 'Vector Type',
  idType: 'ID Type',
  dimension: 'Dimension',
  dimensionTooltip: 'Only vector type has dimension',
  dimensionMutipleWarning: 'Dimension should be 8 multiple',
  dimensionPositiveWarning: 'Positive number only',
  newBtn: 'add new field',
  nameLengthWarning: 'Name length should be less than 256',
  nameContentWarning: 'Name can only contain numbers, letters, and underscores',
  nameFirstLetterWarning:
    'Name first character must be underscore or character(a~z, A~Z)',

  // load dialog
  loadTitle: 'Load Collection',
  loadContent:
    'You are trying to load a collection with data. Only loaded collection can be searched.',
  loadConfirmLabel: 'Load',

  // release dialog
  releaseTitle: 'Release Collection',
  releaseContent:
    'You are trying to release a collection with data. Please be aware that the data will no longer be available for search.',
  releaseConfirmLabel: 'Release',

  // delete dialog
  deleteWarning: `You are trying to delete a collection with data. This action cannot be undone.`,
  deleteDataWarning: `You are trying to delete entites. This action cannot be undone.`,

  // collection tabs
  partitionTab: 'Partitions',
  schemaTab: 'Schema',
  queryTab: 'Data Query',
  previewTab: 'Data Preview',
  startTip: 'Start your data query',
  exprPlaceHolder: 'Please enter your query by using advanced filter ->',
};

export default collectionTrans;
