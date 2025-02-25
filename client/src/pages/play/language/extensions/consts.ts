import { IdentifierMap } from '../../Types';

export const VersionMap = {
  v2: ['vectordb'],
};

export const ObjectMap = {
  vectordb: [
    'aliases',
    'databases',
    'collections',
    'partitions',
    'jobs',
    'indexes',
    'resource_groups',
    'roles',
    'users',
    'entities',
  ],
};

export const IdentifierMapArr: IdentifierMap[] = [
  {
    name: 'aliases',
    children: [
      {
        name: 'alter',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'aliasName' },
        ],
      },
      {
        name: 'create',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'aliasName' },
        ],
      },
      {
        name: 'describe',
        children: [{ name: 'dbName' }, { name: 'aliasName' }],
      },
      {
        name: 'drop',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'aliasName' },
        ],
      },
      {
        name: 'list',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
    ],
  },
  {
    name: 'databases',
    children: [
      {
        name: 'alter',
        children: [
          { name: 'dbName' },
          {
            name: 'properties',
            children: [
              { name: 'database.replica.number' },
              { name: 'database.resource_groups' },
              { name: 'database.diskQuota.mb' },
              { name: 'database.max.collections' },
              { name: 'database.force.deny.writing' },
              { name: 'database.force.deny.reading' },
            ],
          },
        ],
      },
      {
        name: 'create',
        children: [
          { name: 'dbName' },
          {
            name: 'properties',
            children: [
              { name: 'database.replica.number' },
              { name: 'database.resource_groups' },
              { name: 'database.diskQuota.mb' },
              { name: 'database.max.collections' },
              { name: 'database.force.deny.writing' },
              { name: 'database.force.deny.reading' },
            ],
          },
        ],
      },
      { name: 'describe', children: [{ name: 'dbName' }] },
      {
        name: 'drop_properties',
        children: [{ name: 'dbName' }, { name: 'propertyKeys' }],
      },
      { name: 'drop', children: [{ name: 'dbName' }] },
      { name: 'list', children: [] },
    ],
  },
  {
    name: 'collections',
    children: [
      {
        name: 'fields/alter_properties',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'fieldName' },
          {
            name: 'fieldParams',
            children: [{ name: 'max_length' }, { name: 'max_capacity' }],
          },
        ],
      },
      {
        name: 'alter_properties',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          {
            name: 'properties',
            children: [
              { name: 'mmmap.enabled' },
              { name: 'collection.ttl.seconds' },
              { name: 'partitionkey.isolation' },
            ],
          },
        ],
      },
      { name: 'compact', children: [{ name: 'collectionName' }] },
      {
        name: 'create',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'dimension' },
          { name: 'metricType' },
          { name: 'idType' },
          { name: 'autoID' },
          { name: 'primaryFieldName' },
          { name: 'vectorFieldName' },
        ],
      },
      {
        name: 'describe',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'drop_properties',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'propertyKeys' },
        ],
      },
      {
        name: 'drop',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'flush',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'get_load_state',
        children: [
          { name: 'dbName' },
          { name: 'collectionName' },
          { name: 'partitionName' },
        ],
      },
      {
        name: 'get_stats',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'has',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'list',
        children: [{ name: 'dbName' }],
      },
      {
        name: 'load',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'release',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
      {
        name: 'rename',
        children: [
          { name: 'dbName' },
          { name: 'newDbName' },
          { name: 'collectionName' },
        ],
      },
      {
        name: 'refresh_load',
        children: [{ name: 'dbName' }, { name: 'collectionName' }],
      },
    ],
  },
  {
    name: 'partitions',
    children: [
      {
        name: 'create',
        children: [
          { name: 'collectionName' },
          { name: 'partitionName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'drop',
        children: [
          { name: 'collectionName' },
          { name: 'partitionName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'get_stats',
        children: [
          { name: 'collectionName' },
          { name: 'partitionName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'has',
        children: [
          { name: 'collectionName' },
          { name: 'partitionName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'list',
        children: [{ name: 'collectionName' }, { name: 'dbName' }],
      },
      {
        name: 'load',
        children: [
          { name: 'collectionName' },
          { name: 'partitionNames' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'release',
        children: [
          { name: 'collectionName' },
          { name: 'partitionNames' },
          { name: 'dbName' },
        ],
      },
    ],
  },
  {
    name: 'jobs',
    children: [
      {
        name: 'import/create',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'partitionName' },
          { name: 'files' },
          { name: 'options' },
        ],
      },
      {
        name: 'import/describe',
        children: [{ name: 'jobId' }, { name: 'dbName' }],
      },
      { name: 'import/list', children: [{ name: 'dbName' }] },
    ],
  },
  {
    name: 'indexes',
    children: [
      {
        name: 'alter_properties',
        children: [
          { name: 'collectionName' },
          { name: 'indexName' },
          { name: 'dbName' },
          { name: 'properties', children: [{ name: 'mmap.enabled' }] },
        ],
      },
      {
        name: 'create',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          {
            name: 'indexParams',
            children: [
              { name: 'index_type' },
              { name: 'metricType' },
              { name: 'fieldName' },
              { name: 'indexName' },
              {
                name: 'params',
                children: [
                  { name: 'M' },
                  { name: 'efConstruction' },
                  { name: 'nlist' },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'describe',
        children: [
          { name: 'collectionName' },
          { name: 'indexName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'drop_properties',
        children: [
          { name: 'collectionName' },
          { name: 'indexName' },
          { name: 'dbName' },
          { name: 'propertyKeys' },
        ],
      },
      {
        name: 'drop',
        children: [
          { name: 'collectionName' },
          { name: 'indexName' },
          { name: 'dbName' },
        ],
      },
      {
        name: 'list',
        children: [{ name: 'collectionName' }, { name: 'dbName' }],
      },
    ],
  },
  {
    name: 'resource_groups',
    children: [
      {
        name: 'create',
        children: [
          { name: 'name' },
          {
            name: 'config',
            children: [
              { name: 'requests', children: [{ name: 'node_num' }] },
              { name: 'limits', children: [{ name: 'node_num' }] },
              { name: 'transfer_from', children: [{ name: 'resource_group' }] },
              { name: 'transfer_to', children: [{ name: 'resource_group' }] },
            ],
          },
        ],
      },
      { name: 'describe', children: [{ name: 'name' }] },
      { name: 'drop', children: [{ name: 'name' }] },
      { name: 'list', children: [] },
      {
        name: 'transfer_replica',
        children: [
          { name: 'sourceRgName' },
          { name: 'targetRgName' },
          { name: 'collectionName' },
          { name: 'replicaNum' },
        ],
      },
      { name: 'alter', children: [{ name: 'resource_groups' }] },
    ],
  },
  {
    name: 'roles',
    children: [
      { name: 'create', children: [{ name: 'roleName' }] },
      { name: 'describe', children: [{ name: 'roleName' }] },
      { name: 'drop', children: [{ name: 'roleName' }] },
      {
        name: 'grant_privilege',
        children: [
          { name: 'roleName' },
          { name: 'objectType' },
          { name: 'objectName' },
          { name: 'privilege' },
        ],
      },
      { name: 'list', children: [] },
      {
        name: 'revoke_privilege',
        children: [
          { name: 'roleName' },
          { name: 'objectType' },
          { name: 'objectName' },
          { name: 'privilege' },
        ],
      },
    ],
  },
  {
    name: 'users',
    children: [
      {
        name: 'create',
        children: [{ name: 'userName' }, { name: 'password' }],
      },
      { name: 'describe', children: [{ name: 'userName' }] },
      { name: 'drop', children: [{ name: 'userName' }] },
      {
        name: 'grant_role',
        children: [{ name: 'userName' }, { name: 'roleName' }],
      },
      { name: 'list', children: [] },
      {
        name: 'revoke_role',
        children: [{ name: 'userName' }, { name: 'roleName' }],
      },
      {
        name: 'update_password',
        children: [
          { name: 'userName' },
          { name: 'password' },
          { name: 'newPassword' },
        ],
      },
    ],
  },
  {
    name: 'entities',
    children: [
      {
        name: 'delete',
        children: [
          { name: 'collectionName' },
          { name: 'filter' },
          { name: 'dbName' },
          { name: 'partitionName' },
        ],
      },
      {
        name: 'get',
        children: [
          { name: 'collectionName' },
          { name: 'id' },
          { name: 'dbName' },
          { name: 'outputFields' },
          { name: 'partitionNames' },
        ],
      },
      {
        name: 'hybrid_search',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'partitionNames' },
          {
            name: 'search',
            children: [
              { name: 'data' },
              { name: 'annsField' },
              { name: 'filter' },
              { name: 'groupingField' },
              { name: 'metricType' },
              { name: 'limit' },
              { name: 'offset' },
              { name: 'ignoreGrowing' },
              {
                name: 'params',
                children: [{ name: 'radius' }, { name: 'range_filter' }],
              },
            ],
          },
          {
            name: 'rerank',
            children: [
              { name: 'strategy' },
              { name: 'params', children: [{ name: 'k' }] },
            ],
          },
          { name: 'limit' },
          { name: 'outputFields' },
          { name: 'consistencyLevel' },
        ],
      },
      {
        name: 'insert',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'partitionName' },
          { name: 'data', children: [{ name: 'id' }, { name: 'vector' }] },
        ],
      },
      {
        name: 'query',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'partitionNames' },
          { name: 'filter' },
          { name: 'outputFields' },
          { name: 'limit' },
          { name: 'offset' },
        ],
      },
      {
        name: 'search',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'data' },
          { name: 'annsField' },
          { name: 'filter' },
          { name: 'limit' },
          { name: 'offset' },
          { name: 'groupingField' },
          { name: 'outputFields' },
          {
            name: 'searchParams',
            children: [
              { name: 'metricType' },
              {
                name: 'params',
                children: [{ name: 'radius' }, { name: 'range_filter' }],
              },
            ],
          },
          { name: 'partitionNames' },
          { name: 'consistencyLevel' },
        ],
      },
      {
        name: 'upsert',
        children: [
          { name: 'collectionName' },
          { name: 'dbName' },
          { name: 'partitionName' },
          { name: 'data', children: [{ name: 'id' }, { name: 'vector' }] },
        ],
      },
    ],
  },
];
