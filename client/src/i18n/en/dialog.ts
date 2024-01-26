const dialogTrans = {
  deleteTipAction: 'Type',
  deleteTipPurpose: 'to confirm.',
  deleteTitle: `Drop {{type}}`,
  renameTitle: `Rename {{type}}`,
  releaseTitle: `Release {{type}}`,
  duplicateTitle: `Duplicate {{type}}`,
  createAlias: `Create alias for {{type}}`,
  compact: `Compact collection {{type}}`,
  flush: `Flush data for {{type}}`,
  loadTitle: `Load {{type}}`,

  loadContent: `You are trying to load a {{type}} with data. Only loaded {{type}} can be searched.`,
  releaseContent: `You are trying to release {{type}} with data. Please be aware that the data will no longer be available for search.`,

  createTitle: `Create {{type}} on "{{name}}"`,
  emptyTitle: `Empty data for {{type}}`,

  // info
  duplicateCollectionInfo:
    'Duplicating a collection does not copy the data within the collection. It only creates a new collection using the existing schema.',
  flushDialogInfo: `Flush is a process that seals and indexes any remaining segments after data is upserted into Milvus. This avoids brute force searches on unsealed segments.  <br /><br />It's best to use flush at the end of an upsert session to prevent data fragmentation. <br /><br /><strong>Note: that this operation may take some time for large datasets.</strong>`,
  emptyDataDialogInfo: `You are attempting to empty the data. This action cannot be undone, please proceed with caution.`,
};

export default dialogTrans;
