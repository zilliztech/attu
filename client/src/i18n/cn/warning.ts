const warningTrans = {
  required: '{{name}} 是必填的。',
  requiredOnly: '必填的。',
  positive: '{{name}} 应为正数。',
  integer: '{{name}} 应为整数。',
  number: '{{name}} 应为数字。',
  bool: '{{name}} 应为布尔值`true`或`false`。',
  range: '范围是 {{min}} ~ {{max}}。',
  specValueOrRange:
    '{{name}} 应为 {{specValue}}，或在范围 {{min}} ~ {{max}} 内。',
  noSupportIndexType: 'Attu 还不支持 {{type}}。请更换其他字段。',
  valueLength: '{{name}} 长度应在 {{min}} ~ {{max}} 之间。',
  username: ' 用户名不能为空，长度不能超过32个字符。必须以字母开头，只能包含下划线、字母或数字。',
  cloudPassword: `包括以下三种：大写字母、小写字母、数字和特殊字符。`,
};

export default warningTrans;
