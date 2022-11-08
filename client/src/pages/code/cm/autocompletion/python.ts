import {
  Completion,
  snippetCompletion as snip,
} from '@codemirror/autocomplete';
export const keywords = [
  { label: 'False', type: 'keyword' },
  { label: 'import', type: 'keyword' },
  { label: 'in', type: 'keyword' },
  { label: 'True', type: 'keyword' },
  { label: 'is', type: 'keyword' },
  { label: 'from', type: 'keyword' },
  { label: 'not', type: 'keyword' },
  { label: 'or', type: 'keyword' },
];

export const pymilvusKeywords = [
  'CollectionSchema',
  'DataType',
  'Collection',
  'Partition',
  'FieldSchema',
].map(k => ({ label: k, type: 'variable' }));

export const variables = [
  { label: 'schema', type: 'variable' },
  { label: 'using', type: 'variable' },
  { label: 'is_empty', type: 'variable' },
  { label: 'primary_field', type: 'variable' },
  { label: 'partitions', type: 'variable' },
  { label: 'indexes', type: 'variable' },
];

export const snippets: readonly Completion[] = [
  snip('FieldSchema(\n\tname="${}",\n\tdtype=${},\n\tis_primary=${},\n)${}', {
    label: 'FieldSchema',
    detail: 'definition',
    type: 'keyword',
  }),
];
