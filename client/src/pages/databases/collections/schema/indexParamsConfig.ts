import { DataTypeEnum, INDEX_TYPES_ENUM } from '@/consts';

export interface IndexParamConfig {
  label: string;
  key: string;
  type: 'number' | 'text' | 'bool';
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean;
  description?: string;
  helperText?: string;
}

export interface IndexTypeConfig {
  required: string[];
  optional: string[];
  params: Record<string, IndexParamConfig>;
  searchParams?: Record<string, IndexParamConfig>;
}

// Common parameter configurations
const commonParams = {
  nlist: {
    label: 'nlist',
    key: 'nlist',
    type: 'number' as const,
    required: true,
    min: 1,
    max: 65536,
    defaultValue: '128',
    description: 'params.nlist.description',
    helperText: 'params.nlist.helperText',
  },
  M: {
    label: 'M',
    key: 'M',
    type: 'number' as const,
    required: true,
    min: 2,
    max: 2048,
    description: 'params.M.description',
    helperText: 'params.M.helperText',
  },
  efConstruction: {
    label: 'efConstruction',
    key: 'efConstruction',
    type: 'number' as const,
    required: true,
    min: 1,
    max: 2147483647,
    description: 'params.efConstruction.description',
    helperText: 'params.efConstruction.helperText',
  },
  refine: {
    label: 'refine',
    key: 'refine',
    type: 'bool' as const,
    defaultValue: 'false',
    description: 'params.refine.description',
    helperText: 'params.refine.helperText',
  },
  refine_type: {
    label: 'refine_type',
    key: 'refine_type',
    type: 'text' as const,
    description: 'params.refine_type.description',
    helperText: 'params.refine_type.helperText',
  },
  m: {
    label: 'm',
    key: 'm',
    type: 'number' as const,
    required: true,
    min: 1,
    max: 65536,
    defaultValue: '32',
    description: 'params.m.description',
    helperText: 'params.m.helperText',
  },
  nbits: {
    label: 'nbits',
    key: 'nbits',
    type: 'number' as const,
    min: 1,
    max: 24,
    defaultValue: '8',
    description: 'params.nbits.description',
    helperText: 'params.nbits.helperText.common',
  },
  cache_dataset_on_device: {
    label: 'cache_dataset_on_device',
    key: 'cache_dataset_on_device',
    type: 'bool' as const,
    defaultValue: 'false',
    description: 'params.cache_dataset_on_device.description',
    helperText: 'params.cache_dataset_on_device.helperText',
  },
};

// Common search parameter configurations
const commonSearchParams = {
  nprobe: {
    label: 'nprobe',
    key: 'nprobe',
    type: 'number' as const,
    required: false,
    min: 1,
    max: 65536,
    defaultValue: '8',
    description: 'searchParams.nprobe.description',
    helperText: 'searchParams.nprobe.helperText',
  },
  max_empty_result_buckets: {
    label: 'max_empty_result_buckets',
    key: 'max_empty_result_buckets',
    type: 'number' as const,
    required: false,
    min: 1,
    max: 65535,
    defaultValue: '2',
    description: 'searchParams.max_empty_result_buckets.description',
    helperText: 'searchParams.max_empty_result_buckets.helperText',
  },
  ef: {
    label: 'ef',
    key: 'ef',
    type: 'number' as const,
    required: false,
    min: 1,
    max: 2147483647,
    description: 'searchParams.efConstruction.description',
    helperText: 'searchParams.efConstruction.helperText',
  },
  refine_k: {
    label: 'refine_k',
    key: 'refine_k',
    type: 'number' as const,
    required: false,
    min: 1,
    max: 2147483647,
    defaultValue: '1',
    description: 'searchParams.refine_k.description',
    helperText: 'searchParams.refine_k.helperText',
  },
};

export const INDEX_PARAMS_CONFIG: Record<
  string,
  Record<string, IndexTypeConfig>
> = {
  [DataTypeEnum.FloatVector]: {
    [INDEX_TYPES_ENUM.IVF_FLAT]: {
      required: ['nlist'],
      optional: ['nbits'],
      params: {
        nlist: commonParams.nlist,
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
        max_empty_result_buckets: commonSearchParams.max_empty_result_buckets,
      },
    },
    [INDEX_TYPES_ENUM.HNSW]: {
      required: ['M', 'efConstruction'],
      optional: [''],
      params: {
        M: commonParams.M,
        efConstruction: commonParams.efConstruction,
      },
      searchParams: {
        ef: commonSearchParams.ef,
      },
    },
    [INDEX_TYPES_ENUM.IVF_SQ8]: {
      required: ['nlist'],
      optional: [''],
      params: {
        nlist: commonParams.nlist,
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
        max_empty_result_buckets: commonSearchParams.max_empty_result_buckets,
      },
    },
    [INDEX_TYPES_ENUM.IVF_PQ]: {
      required: ['nlist', 'm'],
      optional: ['nbits'],
      params: {
        nlist: commonParams.nlist,
        m: commonParams.m,
        nbits: {
          ...commonParams.nbits,
          max: 64,
          helperText: 'params.nbits.helperText.IVF_PQ',
        },
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
        max_empty_result_buckets: commonSearchParams.max_empty_result_buckets,
      },
    },
    SCANN: {
      required: ['nlist'],
      optional: ['with_raw_data'],
      params: {
        nlist: commonParams.nlist,
        with_raw_data: {
          label: 'with_raw_data',
          key: 'with_raw_data',
          type: 'bool' as const,
          defaultValue: 'true',
          description: 'params.with_raw_data.description',
        },
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
        reorder_k: {
          label: 'reorder_k',
          key: 'reorder_k',
          type: 'number' as const,
          required: false,
          defaultValue: '',
          description: 'searchParams.reorder_k.description',
          helperText: 'searchParams.reorder_k.helperText',
        },
      },
    },
    [INDEX_TYPES_ENUM.HNSW_SQ]: {
      required: ['M', 'efConstruction', 'sq_type'],
      optional: ['refine'],
      params: {
        M: commonParams.M,
        efConstruction: commonParams.efConstruction,
        sq_type: {
          label: 'sq_type',
          key: 'sq_type',
          type: 'text' as const,
          required: true,
          defaultValue: 'SQ8',
          description: 'params.sq_type.description',
          helperText: 'params.sq_type.helperText',
        },
        refine: commonParams.refine,
        refine_type: commonParams.refine_type,
      },
      searchParams: {
        ef: commonSearchParams.ef,
        refine_k: commonSearchParams.refine_k,
      },
    },
    [INDEX_TYPES_ENUM.HNSW_PQ]: {
      required: ['M', 'efConstruction', 'm', 'nbits'],
      optional: ['refine'],
      params: {
        M: commonParams.M,
        efConstruction: commonParams.efConstruction,
        m: commonParams.m,
        nbits: commonParams.nbits,
        refine: commonParams.refine,
        refine_type: commonParams.refine_type,
      },
      searchParams: {
        ef: commonSearchParams.ef,
        refine_k: commonSearchParams.refine_k,
      },
    },
    [INDEX_TYPES_ENUM.HNSW_PRQ]: {
      required: ['M', 'efConstruction', 'm', 'nbits', 'nrq'],
      optional: ['refine'],
      params: {
        M: commonParams.M,
        efConstruction: commonParams.efConstruction,
        m: commonParams.m,
        nbits: commonParams.nbits,
        nrq: {
          label: 'nrq',
          key: 'nrq',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 16,
          defaultValue: '2',
          description: 'params.nrq.description',
          helperText: 'params.nrq.helperText',
        },
        refine: commonParams.refine,
        refine_type: commonParams.refine_type,
      },
      searchParams: {
        ef: commonSearchParams.ef,
        refine_k: commonSearchParams.refine_k,
      },
    },
    [INDEX_TYPES_ENUM.DISKANN]: {
      required: [],
      optional: [],
      params: {},
      searchParams: {
        search_list: {
          label: 'search_list',
          key: 'search_list',
          type: 'number' as const,
          required: false,
          defaultValue: '16',
          description: 'searchParams.search_list.description',
          helperText: 'searchParams.search_list.helperText',
        },
      },
    },
    [INDEX_TYPES_ENUM.GPU_CAGRA]: {
      required: ['intermediate_graph_degree', 'graph_degree', 'build_algo'],
      optional: ['cache_dataset_on_device', 'adapt_for_cpu'],
      params: {
        intermediate_graph_degree: {
          label: 'intermediate_graph_degree',
          key: 'intermediate_graph_degree',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 1024,
          defaultValue: '128',
          description: 'params.intermediate_graph_degree.description',
          helperText: 'params.intermediate_graph_degree.helperText',
        },
        graph_degree: {
          label: 'graph_degree',
          key: 'graph_degree',
          type: 'number' as const,
          required: true,
          min: 1,
          max: 1024,
          defaultValue: '64',
          description: 'params.graph_degree.description',
          helperText: 'params.graph_degree.helperText',
        },
        build_algo: {
          label: 'build_algo',
          key: 'build_algo',
          type: 'text' as const,
          required: true,
          defaultValue: 'IVF_PQ',
          description: 'params.build_algo.description',
          helperText: 'params.build_algo.helperText',
        },
        cache_dataset_on_device: commonParams.cache_dataset_on_device,
        adapt_for_cpu: {
          label: 'adapt_for_cpu',
          key: 'adapt_for_cpu',
          type: 'bool' as const,
          defaultValue: 'false',
          description: 'params.adapt_for_cpu.description',
          helperText: 'params.adapt_for_cpu.helperText',
        },
      },
      searchParams: {
        itopk_size: {
          label: 'itopk_size',
          key: 'itopk_size',
          type: 'number' as const,
          required: false,
          min: 1,
          max: 2147483647,
          defaultValue: '',
          description: 'searchParams.itopk_size.description',
          helperText: 'searchParams.itopk_size.helperText',
        },
        search_width: {
          label: 'search_width',
          key: 'search_width',
          type: 'number' as const,
          required: false,
          min: 1,
          max: 2147483647,
          defaultValue: '',
          description: 'searchParams.search_width.description',
          helperText: 'searchParams.search_width.helperText',
        },
        min_iterations: {
          label: 'min_iterations',
          key: 'min_iterations',
          type: 'number' as const,
          required: false,
          min: 0,
          max: 2147483647,
          defaultValue: '0',
          description: 'searchParams.min_iterations.description',
          helperText: 'searchParams.min_iterations.helperText',
        },
        max_iterations: {
          label: 'max_iterations',
          key: 'max_iterations',
          type: 'number' as const,
          required: false,
          min: 0,
          max: 2147483647,
          defaultValue: '0',
          description: 'searchParams.max_iterations.description',
          helperText: 'searchParams.max_iterations.helperText',
        },
        team_size: {
          label: 'team_size',
          key: 'team_size',
          type: 'number' as const,
          required: false,
          min: 0,
          max: 32,
          defaultValue: '0',
          description: 'searchParams.team_size.description',
          helperText: 'searchParams.team_size.helperText',
        },
        ef: commonSearchParams.ef,
      },
    },
    [INDEX_TYPES_ENUM.GPU_IVF_FLAT]: {
      required: ['nlist'],
      optional: ['cache_dataset_on_device'],
      params: {
        nlist: commonParams.nlist,
        cache_dataset_on_device: commonParams.cache_dataset_on_device,
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
      },
    },
    [INDEX_TYPES_ENUM.GPU_IVF_PQ]: {
      required: ['nlist', 'm'],
      optional: ['nbits', 'cache_dataset_on_device'],
      params: {
        nlist: commonParams.nlist,
        m: commonParams.m,
        nbits: {
          ...commonParams.nbits,
          max: 16,
          helperText: 'params.nbits.helperText.IVF_PQ',
        },
        cache_dataset_on_device: commonParams.cache_dataset_on_device,
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
      },
    },
  },
  [DataTypeEnum.BinaryVector]: {
    [INDEX_TYPES_ENUM.BIN_IVF_FLAT]: {
      required: ['nlist'],
      optional: [],
      params: {
        nlist: commonParams.nlist,
      },
      searchParams: {
        nprobe: commonSearchParams.nprobe,
        max_empty_result_buckets: commonSearchParams.max_empty_result_buckets,
      },
    },
  },
};
