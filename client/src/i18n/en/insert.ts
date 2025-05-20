const insertTrans = {
  import: 'Import File',
  targetTip: 'Where to put your data',
  file: 'File',
  uploaderLabel: 'Select a .csv or .json file',
  fileNamePlaceHolder: 'No file has been selected',
  sample: 'CSV Sample',
  noteTitle: 'Note',
  notes: [
    `CSV or JSON file is supported`,
    `Ensure data column names match field label names in Schema.`,
    `Data should be <150MB and <100,000 rows for proper import.`,
    `"Import File" only appends new records; it doesn't update existing ones.`,
  ],
  overSizeWarning: 'File data size should less than {{size}}MB',
  isContainFieldNames: 'First row contains field names?',

  uploadFileDisableTooltip: 'Please select collection before uploading',
  uploadFieldNamesLenWarning:
    'Uploaded data column count is not equal to schema count',
  uploadAutoIdFieldWarning:
    'AutoId field ({{fieldName}}) does not require data',

  previewTipData: 'Data Preview(Top 4 rows shown)',
  previewTipAction: '*Change header cell selector value to edit field name',
  requiredFieldName: 'Field Name*',

  statusLoading: 'Your data is importing now...It may take few minutes',
  statusLoadingTip: 'Please wait patiently, thank you',
  statusSuccess: 'Import File Successfully!',
  statusError: 'Import File Failed!',

  importSampleData: 'Insert sample data into {{collection}}',
  sampleDataSize: 'Choose or enter sample data size, max 10000',
  importSampleDataDesc: `This function inserts randomly generated data matching the collection schema. Useful for testing and development. Click the download button to get the data.`,
  downloadSampleDataCSV: `Download Sample CSV Data`,
  downloadSampleDataJSON: `Download Sample JSON Data`,
};

export default insertTrans;
