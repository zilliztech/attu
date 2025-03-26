export const DEFAULT_CODE_VALUE = `# TOKEN username:password

# create collection
POST /v2/vectordb/collections/create
{
  "collectionName": "attu_milvus_example",
  "schema": {
    "fields": [
      {
        "fieldName": "pk",
        "dataType": "VarChar",
        "isPrimary": true,
        "elementTypeParams": {
          "max_length": 100
        }
      },
      {
        "fieldName": "dense_vector",
        "dataType": "FloatVector",
        "elementTypeParams": {
          "dim": 4
        }
      }
    ]
  }
}

# create index
POST /v2/vectordb/indexes/create
{
  "collectionName": "attu_milvus_example",
  "indexParams": [
    {
            "index_type": "AUTOINDEX",
            "metricType": "L2",
            "fieldName": "dense_vector",
            "indexName": "dense_vector"
        }
  ]
}

# load collection
POST /v2/vectordb/collections/load
{
  "collectionName": "attu_milvus_example"
}

# insert data
POST /v2/vectordb/entities/insert
{
  "collectionName": "attu_milvus_example",
  "data": [
    {
      "pk": "id1",
      "dense_vector": [0.1, 0.2, 0.3, 0.4]
    },
    {
      "pk": "id2",
      "dense_vector": [0.5, 0.6, 0.7, 0.8]
    }
  ]
}

# vector search
POST /v2/vectordb/entities/search
{
  "collectionName": "attu_milvus_example",
  "data": [[0.15, 0.25, 0.35, 0.45]],
  "annsField": "dense_vector",
  "limit": 3,
  "outputFields": ["pk", "dense_vector"]
}
`;

export const DEFAULT_FOLD_LINE_RANGES = [
  { lineFrom: 5, lineTo: 26 },
  { lineFrom: 30, lineTo: 40 },
  { lineFrom: 44, lineTo: 46 },
  { lineFrom: 50, lineTo: 62 },
  { lineFrom: 66, lineTo: 72 },
];
