export default {
  // dialog
  collection: 'Collection',
  create: 'Create Collection',
  edit: 'Edit Collection',
  deleteMultipleTitle: 'Delete {{number}} Collections',
  deleteWarning:
    'You are trying to delete a collection with data. This action cannot be undone.',
  deleteMultipleWarning:
    'You are trying to delete multiple collections. This action cannot be undone.',

  // dialog form and table
  name: 'Name',
  database: 'Database',
  dimension: 'Dimension',
  metric: 'Metric Type',
  desc: 'Description',
  time: 'Created Time',
  partition: 'Partition Count',
  index: 'Index count',
  location: 'Location',

  empty: 'No Collection',

  // dialog snackbar
  createSuccess: `"{{collectionName}}" is created in "{{dbName}}"`,
  editSuccess: `Collection "{{name}}" is updated`,

  deleteMultipleSuccess: '{{number}} collections are deleted',
  deleteSuccess: `Collection "{{name}}" is deleted`,
};
