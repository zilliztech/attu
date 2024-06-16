const warningTrans = {
  required: '{{name}} 是必需的',
  requiredOnly: '必需的',
  positive: '{{name}} 应为正数',
  integer: '{{name}} 应为整数',
  number: '{{name}} 应为数字',
  bool: '{{name}} 应为布尔值`true`或`false`',
  range: '范围是 {{min}} ~ {{max}}',
  specValueOrRange:
    '{{name}} 应为 {{specValue}}，或在范围 {{min}} ~ {{max}} 内',
  noSupportIndexType:
    'Attu 还不支持 {{type}}。请更换其他字段',
};

export default warningTrans;