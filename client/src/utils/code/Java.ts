import { CreateIndexCodeParam } from './Types';

export const getCreateIndexJavaCode = (params: CreateIndexCodeParam) => {
  const {
    collectionName,
    fieldName,
    indexName,
    metricType,
    extraParams,
    indexType,
  } = params;

  const JavaCode = `import io.milvus.param.*;

  // Index type
final IndexType INDEX_TYPE = IndexType.IVF_FLAT;
// Index param
final String INDEX_PARAM = ${JSON.stringify(extraParams, null, 2)};
// Create index
milvusClient.createIndex(
  CreateIndexParam.newBuilder()
    .withCollectionName("${collectionName}")
    .withIndexName("${indexName}")
    .withFieldName("${fieldName}")
    .withIndexType("IndexType.${indexType}")
    .withMetricType("${metricType}")
    .withExtraParam(INDEX_PARAM)
    .withSyncMode(Boolean.FALSE)
    .build()
);
`;

  return JavaCode;
};
