const dialogTrans = {
  value: 'value',
  deleteTipAction: 'Type',
  deleteTipPurpose: 'to confirm.',
  deleteTitle: `Drop {{type}}`,
  deleteEntityTitle: `Delete Entity`,
  renameTitle: `Rename {{type}}`,
  releaseTitle: `Release {{type}}`,
  duplicateTitle: `Duplicate {{type}}`,
  createAlias: `Create alias for {{type}}`,
  compact: `Compact collection {{type}}`,
  flush: `Flush data for {{type}}`,
  loadTitle: `Load {{type}}`,
  editEntityTitle: `Edit Entity(JSON)`,
  editAnalyzerTitle: `Edit Analyzer`,
  modifyReplicaTitle: `Modify replica for {{type}}`,

  loadContent: `You are trying to load a {{type}} with data. Only loaded {{type}} can be searched.`,
  releaseContent: `You are trying to release {{type}} with data. Please be aware that the data will no longer be available for search.`,

  createTitle: `Create {{type}} on "{{name}}"`,
  emptyTitle: `Empty data for {{type}}`,
  editPropertyTitle: `Edit property {{type}}`,
  resetPropertyTitle: `Reset property {{type}}`,

  // info
  duplicateCollectionInfo:
    'Duplicating a collection does not copy the data within the collection. It only creates a new collection using the existing schema.',
  flushDialogInfo: `Flush is a process that seals and indexes any remaining segments after data is upserted into Milvus. This avoids brute force searches on unsealed segments.  <br /><br />It's best to use flush at the end of an upsert session to prevent data fragmentation. <br /><br /><strong>Note: that this operation may take some time for large datasets.</strong>`,
  emptyDataDialogInfo: `You are attempting to empty the data. This action cannot be undone, please proceed with caution.`,
  resetPropertyInfo: `Are you sure you want to reset the property?`,
  editEntityInfo: `NOTE: Edit PrimayKey field will create a new entity.`,
  editAnalyzerInfo: `Analyzer is defined in JSON format, please refer to milvus.io for <a href='https://milvus.io/docs/analyzer-overview.md' target='_blank'>more information</a>.`,
};

export default dialogTrans;
