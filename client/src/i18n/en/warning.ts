const warningTrans = {
  required: '{{name}} is required',
  requiredOnly: 'Required',
  positive: '{{name}} should be positive',
  integer: '{{name}} should be integers',
  number: '{{name}} should be numbers',
  bool: '{{name}} should be boolean value `true` or `false`',
  range: 'Range is {{min}} ~ {{max}}',
  specValueOrRange:
    '{{name}} should be {{specValue}}, or in range {{min}} ~ {{max}}',
  noSupportIndexType:
    'Attu has not supported {{type}} yet. Please change another field',
};

export default warningTrans;
