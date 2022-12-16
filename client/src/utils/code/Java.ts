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

//   const JavaCode = `import { MilvusClient } from '@zilliz/milvus2-sdk-node';
// const client = new MilvusClient(milvus_address);

// client.indexManager.createIndex({
//   collection_name: '${collectionName}',
//   index_name:'${indexName}',
//   field_name: '${fieldName}',
//   ${
//     isScalarField
//       ? ''
//       : `extra_params: ${JSON.stringify(extraParams, null, 2)},`
//   }
// });
