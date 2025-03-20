const partitionTrans = {
  create: 'Partition',
  delete: 'Delete partition',

  partition: 'Partition',

  id: 'ID',
  name: 'Name',
  createdTime: 'Created Time',
  status: 'Status',
  rowCount: 'Approx Entity Count',
  tooltip:
    "If this collection is not loaded, this count is an approximate value and may have a slight delay due to Milvus' unique mechanism. The actual count may vary and will be updated periodically. Please note that this number should be used as a reference, not an exact count.",

  createTitle: 'Create Partition',
  nameWarning: '_default is reserved, cannot be used as name',

  deleteWarning:
    'You are trying to delete partition. This action cannot be undone.',
  deletePartitionError: 'default partition cannot be dropped',
};

export default partitionTrans;
