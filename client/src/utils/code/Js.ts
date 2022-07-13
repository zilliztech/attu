import { CreateIndexCodeParam } from './Types';

export const getCreateIndexJSCode = (params: CreateIndexCodeParam) => {
  const { collectionName, fieldName, indexName, isScalarField, extraParams } =
    params;

  const jsCode = `import { MilvusClient } from '@zilliz/milvus2-sdk-node';
const client = new MilvusClient(milvus_address);

client.indexManager.createIndex({
  collection_name: '${collectionName}',
  index_name:'${indexName}',
  field_name: '${fieldName}',
  ${
    isScalarField
      ? ''
      : `extra_params: ${JSON.stringify(extraParams, null, 2)},`
  }
});`;

  return jsCode;
};
