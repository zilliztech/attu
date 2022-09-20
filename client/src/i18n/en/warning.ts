const warningTrans = {
  required: '{{name}} is required',
  positive: '{{name}} should be positive',
  integer: '{{name}} should be integers',
  range: 'range is {{min}} ~ {{max}}',
  specValueOrRange:
    '{{name}} should be {{specValue}}, or in range {{min}} ~ {{max}}',
  noSupportIndexType:
    'Attu has not supported {{type}} yet. Please change another field',
};

export default warningTrans;
