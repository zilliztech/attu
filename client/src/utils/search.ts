import { VectorStrToObject } from '@/utils';
import type { FieldOption } from '../types/SearchTypes';
import type { FieldObject, CollectionFullObject } from '@server/types';
import type { SearchParams } from '@/pages/databases/types';

export const getVectorFieldOptions = (fields: FieldObject[]): FieldOption[] => {
  const options: FieldOption[] = fields.map(f => {
    return {
      field: f,
      label: f.name,
      value: f.name,
    };
  });

  return options;
};

// new search: build search params
export const buildSearchParams = (searchParams: SearchParams) => {
  const data: any = [];
  const weightedParams: number[] = [];

  searchParams.searchParams.forEach((s, index) => {
    const formatter =
      VectorStrToObject[s.field.data_type as keyof typeof VectorStrToObject];
    if (s.selected) {
      data.push({
        anns_field: s.field.name,
        data: s.field.is_function_output
          ? s.data.replace(/\n/g, '')
          : formatter(s.data),
        params: s.params,
      });
      weightedParams.push(
        searchParams.globalParams.weightedParams.weights[index]
      );
    }
  });

  const params: any = {
    output_fields: searchParams.globalParams.output_fields,
    limit: searchParams.globalParams.topK,
    data: data,
    filter: searchParams.globalParams.filter,
    consistency_level: searchParams.globalParams.consistency_level,
  };

  if (searchParams.partitions.length > 0) {
    params.partition_names = searchParams.partitions.map(p => p.name);
  }

  // group_by_field if exists
  if (searchParams.globalParams.group_by_field) {
    params.group_by_field = searchParams.globalParams.group_by_field;
  }

  // reranker if exists
  if (data.length > 1) {
    if (searchParams.globalParams.rerank === 'rrf') {
      params.rerank = {
        strategy: 'rrf',
        params: searchParams.globalParams.rrfParams,
      };
    }
    if (searchParams.globalParams.rerank === 'weighted') {
      params.rerank = {
        strategy: 'weighted',
        params: { weights: weightedParams },
      };
    }
  }

  return params;
};

export const buildSearchCode = (
  searchParams: SearchParams,
  collection: CollectionFullObject
) => {
  const params = buildSearchParams(searchParams);
  const isMultiple = params.data.length > 1;

  return {
    python: isMultiple
      ? buildMultipleSearchPythonCode(params, collection)
      : buildSingleSearchPythonCode(params, collection),
    ['node.js']: buildNodeSearchCode(params, collection),
  };
};

export const buildSingleSearchPythonCode = (
  params: any,
  collection: CollectionFullObject
) => {
  const code = `# python search code
res = client.search(
  collection_name="${collection.collection_name}", # Collection name
  data=query_vector, # Replace with your query vector
  search_params={
    "metric_type": "${collection.schema.vectorFields[0].index.metricType}",
    "params": ${JSON.stringify(params.data[0].params)}, # Search parameters
  }, # Search parameters
  limit=${params.limit}, # Max. number of search results to return
  output_fields=${JSON.stringify(
    params.output_fields.filter((f: string) => f !== '$meta')
  )}, # Fields to return in the search results
  consistency_level="${params.consistency_level}"
)
`;

  return code;
};

export const buildMultipleSearchPythonCode = (
  params: any,
  collection: CollectionFullObject
) => {
  const code = `from pymilvus import AnnSearchRequest, RRFRanker, WeightedRanker`;

  // build request
  const data = params.data.map((d: any, i: number) => {
    const req = `search_param_${i} = {
    "data": query_vector, # Query vector
    "anns_field": "${d.anns_field}", # Vector field name
    "param": {
        "metric_type": "${
          collection.schema.vectorFields[i].index.metricType
        }", # This parameter value must be identical to the one used in the collection schema
        "params": ${JSON.stringify(d.params)}, # Search parameters
    }
  }`;
    return `${req}\nrequest_${i} = AnnSearchRequest(**search_param_${i})`;
  });

  let reranker = '';
  // reranks
  if (params.rerank) {
    if (params.rerank.strategy === 'rrf') {
      reranker = `# Rerank by RRF strategy\nrerank = RRFRanker(k=${params.rerank.params.k})`;
    }
    if (params.rerank.strategy === 'weighted') {
      reranker = `# Rerank by Weighted strategy\nrerank = WeightedRanker(${JSON.stringify(
        params.rerank.params.weights
      )})`;
    }
  }

  return `${code}\n\n${data.join('\n\n')}\n\nreqs = [${Array.from(
    { length: params.data.length },
    (_, i) => `request_${i}`
  ).join(
    ', '
  )}]\n${reranker}\n\n# Perform search\nres = client.search(reqs, rerank, limit=${
    params.limit
  }, output_fields=${JSON.stringify(
    params.output_fields
  )}, consistency_level="${params.consistency_level}")`;
};

export const buildNodeSearchCode = (
  params: any,
  collection: CollectionFullObject
) => {
  // remove data.data
  params.data.forEach((d: any) => {
    d.data = `YOUR_QUERY_VECTOR`;
  });

  return `// nodejs search code
const params = ${JSON.stringify(
    { collection_name: collection.collection_name, ...params },
    null,
    2
  )};\nawait milvusClient.search(params)`;
};
