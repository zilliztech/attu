import { VectorStrToObject } from '@/utils';
import type { FieldOption } from '../types/SearchTypes';
import type { FieldObject } from '@server/types';
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
