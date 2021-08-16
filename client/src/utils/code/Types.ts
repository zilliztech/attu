export interface KeyValuePairs {
  key: string;
  value: string;
}

export interface CreateIndexCodeParam {
  collectionName: string;
  fieldName: string;
  extraParams: KeyValuePairs[];
}
