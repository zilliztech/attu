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
    `Data size should be less than 5MB and the number of rows should be less than 100000, for the data to be imported properly.`,
    `The "Import Data" option will only append new records. You cannot update existing records using this option.`,
  ],
  overSizeWarning: 'File data size should less than 5MB',
  isContainFieldNames: 'First row contains field names?',
  uploadFieldNamesLenWarning:
    'Uploaded data column count is not equal to schema count',
};

export default insertTrans;
