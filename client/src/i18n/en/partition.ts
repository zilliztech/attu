export default {
  partition: 'Partition',
  create: 'Create Partition',
  edit: 'Edit Partition',
  deleteMultipleTitle: 'Delete {{number}} Partitions',
  deleteWarning:
    'You are trying to delete a partition with data. This action cannot be undone.',
  deleteMultipleWarning:
    'You are trying to delete multiple partitions. This action cannot be undone.',

  empty: 'No Parition',

  // form
  database: 'Database',
  collection: 'Collection',

  // table
  name: 'Name',
  desc: 'Description',
  time: 'Create Time',
  location: 'Location',

  // snackbar
  createSuccess: `"{{partitionName}}" is created in "{{collectionName}}"`,
  editSuccess: `Partition "{{name}}" is updated`,

  deleteSuccess: `Partition "{{name}}" is deleted`,
  deleteMultipleSuccess: '{{number}} partitions are deleted',
};
