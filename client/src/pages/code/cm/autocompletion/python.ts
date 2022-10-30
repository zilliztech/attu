import {
  Completion,
  snippetCompletion as snip,
} from '@codemirror/autocomplete';
export const keywords = [
  { label: 'False', type: 'keyword' },
  { label: 'await', type: 'keyword' },
  { label: 'else', type: 'keyword' },
  { label: 'import', type: 'keyword' },
  { label: 'pass', type: 'keyword' },
  { label: 'None', type: 'keyword' },
  { label: 'break', type: 'keyword' },
  { label: 'except', type: 'keyword' },
  { label: 'in', type: 'keyword' },
  { label: 'raise', type: 'keyword' },
  { label: 'True', type: 'keyword' },
  { label: 'class', type: 'keyword' },
  { label: 'finally', type: 'keyword' },
  { label: 'is', type: 'keyword' },
  { label: 'return', type: 'keyword' },
  { label: 'and', type: 'keyword' },
  { label: 'continue', type: 'keyword' },
  { label: 'for', type: 'keyword' },
  { label: 'lambda', type: 'keyword' },
  { label: 'try', type: 'keyword' },
  { label: 'as', type: 'keyword' },
  { label: 'def', type: 'keyword' },
  { label: 'from', type: 'keyword' },
  { label: 'nonlocal', type: 'keyword' },
  { label: 'while', type: 'keyword' },
  { label: 'asset', type: 'keyword' },
  { label: 'del', type: 'keyword' },
  { label: 'global', type: 'keyword' },
  { label: 'not', type: 'keyword' },
  { label: 'with', type: 'keyword' },
  { label: 'async', type: 'keyword' },
  { label: 'elif', type: 'keyword' },
  { label: 'if', type: 'keyword' },
  { label: 'or', type: 'keyword' },
  { label: 'yield', type: 'keyword' },
];

export const pymilvusKeywords = [
  { label: 'CollectionSchema', type: 'variable' },
  { label: 'DataType', type: 'variable' },
  { label: 'Collection', type: 'variable' },
];

export const pymilvusObjectKeyMap: any = {
  Collection: [
    { label: 'create_index()', type: 'variable' },
    { label: 'create_parititon()', type: 'variable' },
    { label: 'delete()', type: 'variable' },
    { label: 'drop_index()', type: 'variable' },
    { label: 'drop_partition()', type: 'variable' },
    { label: 'index()', type: 'variable' },
    { label: 'insert()', type: 'variable' },
    { label: 'load()', type: 'variable' },
    { label: 'partition()', type: 'variable' },
    { label: 'query()', type: 'variable' },
    { label: 'release()', type: 'variable' },
    { label: 'search()', type: 'variable' },
    { label: 'compact()', type: 'variable' },
  ],
};

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
