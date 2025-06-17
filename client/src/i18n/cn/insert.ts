const insertTrans = {
  import: '导入数据',
  targetTip: '选择导入目标',
  file: '文件',
  uploaderLabel: '选择 CSV 或者 JSON 文件',
  fileNamePlaceHolder: '未选择文件',
  sample: '样本',
  noteTitle: '注意',
  notes: [
    `支持 CSV 或者 JSON 文件。`,
    `确保 CSV 列名或 JSON key值与 Schema 字段名一致`,
    `文件大小不能超过 256MB。`,
    `"导入数据" 只会插入新数据，不支持 upsert。`,
  ],
  overSizeWarning: '文件数据大小应小于 {{size}}MB',
  isContainFieldNames: '第一行包含字段名？',

  uploadFileDisableTooltip: '上传前请先选择 Collection',
  uploadFieldNamesLenWarning: '上传的数据列数与 Schema 字段数不相等',
  uploadAutoIdFieldWarning: 'AutoId 字段（{{fieldName}}）不需要数据',

  previewTipData: '数据预览（显示前 4 行）',
  previewTipAction: '*更改标题单元格选择器值以编辑字段名',
  requiredFieldName: '字段名*',

  statusLoading: '您的数据正在导入中...可能需要几分钟.',
  importingRecords: '正在导入 {{count}} 条数据...可能需要几分钟.',
  statusSuccess: '数据导入成功！',
  statusError: '数据导入失败！',

  importSampleData: '将样本数据导入到 {{collection}}',
  sampleDataSize: '选择或者输入样本数据大小, 最大值为 10000',
  importSampleDataDesc: `此功能导入与 Collection Schema 匹配的随机生成的数据。对于测试和开发很有用。点击下载按钮获取数据。`,
  downloadSampleDataCSV: `下载样本 CSV 数据`,
  downloadSampleDataJSON: `下载样本 JSON 数据`,
};

export default insertTrans;
