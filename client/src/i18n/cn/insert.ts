const insertTrans = {
  import: '导入数据',
  targetTip: '放置数据的位置',
  file: '文件',
  uploaderLabel: '选择CSV或者JSON文件',
  fileNamePlaceHolder: '未选择文件',
  sample: '样本',
  noteTitle: '注意',
  notes: [
    `确保数据中的列名与Schema中的字段标签名相同。`,
    `数据大小应小于150MB，行数应小于100000，以便正确导入数据。`,
    `"导入数据"选项只会添加新记录。您不能使用此选项更新现有记录。`,
  ],
  overSizeWarning: '文件数据大小应小于{{size}}MB',
  isContainFieldNames: '第一行包含字段名？',

  uploadFileDisableTooltip: '上传前请先选择Collection',
  uploadFieldNamesLenWarning: '上传的数据列数与模式计数不相等',
  uploadAutoIdFieldWarning: 'AutoId字段（{{fieldName}}）不需要数据',

  previewTipData: '数据预览（显示前4行）',
  previewTipAction: '*更改标题单元格选择器值以编辑字段名',
  requiredFieldName: '字段名*',

  statusLoading: '您的数据正在导入中...可能需要几分钟',
  statusLoadingTip: '请耐心等待，谢谢',
  statusSuccess: '数据导入成功！',
  statusError: '数据导入失败！',

  importSampleData: '将样本数据导入到{{collection}}',
  sampleDataSize: '选择样本数据大小',
  importSampleDataDesc: `此功能导入与Collection模式匹配的随机生成的数据。对于测试和开发很有用。点击下载按钮获取数据。`,
  downloadSampleDataCSV: `下载样本CSV数据`,
  downloadSampleDataJSON: `下载样本JSON数据`,
};

export default insertTrans;
