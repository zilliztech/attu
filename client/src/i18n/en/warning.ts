const warningTrans = {
  required: '{{name}} is required.',
  requiredOnly: 'Required.',
  positive: '{{name}} should be positive.',
  integer: '{{name}} should be integers.',
  number: '{{name}} should be numbers.',
  bool: '{{name}} should be boolean value `true` or `false`.',
  range: 'Range is {{min}} ~ {{max}}.',
  specValueOrRange:
    '{{name}} should be {{specValue}}, or in range {{min}} ~ {{max}}.',
  noSupportIndexType:
    'Attu has not supported {{type}} yet. Please change another field.',
  valueLength: '{{name}} length should be in {{min}} ~ {{max}}.',
  username: ' Username must not be empty, and must not exceed 32 characters in length. It must start with a letter, and only contains underscores, letters, or numbers.',
};

export default warningTrans;
