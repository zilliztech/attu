const insertTrans = {
  import: 'Import Data',
  targetTip: 'Where to put your data',
  file: 'File',
  uploaderLabel: 'Choose CSV File',
  fileNamePlaceHolder: 'No file selected',
  sample: 'CSV Sample',
  noteTitle: 'Note',
  notes: [
    `Make sure column names in the data are same as the field label names in Schema.`,
    `Data size should be less than 150MB and the number of rows should be less than 100000, for the data to be imported properly.`,
    `The "Import Data" option will only append new records. You cannot update existing records using this option.`,
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
  statusSuccess: 'Import Data Successfully!',
  statusError: 'Import Data Failed!',

  importSampleData: 'Import sample data into {{collection}}',
  sampleDataSize: 'Choose sample data size',
  importSampleDataDesc: `Import random data based on the collection's schema.`
};

export default insertTrans;
