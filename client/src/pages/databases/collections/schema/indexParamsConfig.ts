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
}

export const INDEX_PARAMS_CONFIG: Record<
  string,
  Record<string, IndexTypeConfig>
> = {
  [DataTypeEnum.FloatVector]: {
    [INDEX_TYPES_ENUM.IVF_FLAT]: {
      required: ['nlist'],
      optional: ['nbits'],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of clusters to create using k-means algorithm',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
        nbits: {
          label: 'nbits',
          key: 'nbits',
          type: 'number',
          min: 1,
          max: 16,
          defaultValue: '8',
          description: 'Number of bits for quantization',
          helperText: 'Must be between 1 and 16',
        },
      },
    },
    [INDEX_TYPES_ENUM.HNSW]: {
      required: ['M', 'efConstruction'],
      optional: [''],
      params: {
        M: {
          label: 'M',
          key: 'M',
          type: 'number',
          required: true,
          min: 2,
          max: 2048,
          description: 'Maximum number of connections per element',
          helperText: 'Must be between 2 and 2048',
        },
        efConstruction: {
          label: 'efConstruction',
          key: 'efConstruction',
          type: 'number',
          required: true,
          min: 1,
          max: 2147483647,
          description: 'Size of the dynamic candidate list',
          helperText: 'Must be between 1 and 2147483647',
        },
      },
    },
    [INDEX_TYPES_ENUM.IVF_SQ8]: {
      required: ['nlist'],
      optional: [''],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of clusters',
          helperText: 'Must be between 1 and 65536',
        },
      },
    },
    [INDEX_TYPES_ENUM.IVF_PQ]: {
      required: ['nlist', 'm'],
      optional: ['nbits'],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of cluster units',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
        m: {
          label: 'm',
          key: 'm',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of factors of product quantization',
          helperText:
            'Must be a divisor of vector dimension (dim mod m == 0). Recommended: D/2, where D is vector dimension',
        },
        nbits: {
          label: 'nbits',
          key: 'nbits',
          type: 'number',
          min: 1,
          max: 64,
          defaultValue: '8',
          description:
            'Number of bits in which each low-dimensional vector is stored',
          helperText:
            'Determines codebook size (2^nbits centroids). Higher values improve accuracy but increase index size',
        },
      },
    },
    SCANN: {
      required: ['nlist'],
      optional: ['with_raw_data'],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of clusters to create using k-means algorithm',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
        with_raw_data: {
          label: 'with_raw_data',
          key: 'with_raw_data',
          type: 'bool',
          defaultValue: 'true',
          description: 'Whether to store raw data',
        },
      },
    },
    [INDEX_TYPES_ENUM.HNSW_SQ]: {
      required: ['M', 'efConstruction', 'sq_type'],
      optional: ['refine', 'refine_type'],
      params: {
        M: {
          label: 'M',
          key: 'M',
          type: 'number',
          required: true,
          min: 2,
          max: 2048,
          description: 'Maximum number of outgoing connections in the graph',
          helperText:
            'Higher M leads to higher accuracy/run_time at fixed ef/efConstruction. Must be between 2 and 2048',
        },
        efConstruction: {
          label: 'efConstruction',
          key: 'efConstruction',
          type: 'number',
          required: true,
          min: 1,
          max: 2147483647,
          description: 'Controls index search speed/build speed tradeoff',
          helperText:
            'Increasing the efConstruction parameter may enhance index quality, but it also tends to lengthen the indexing time',
        },
        sq_type: {
          label: 'sq_type',
          key: 'sq_type',
          type: 'text',
          required: true,
          defaultValue: 'SQ8',
          description: 'Scalar quantizer type',
          helperText: 'Available options: SQ6, SQ8, BF16, FP16',
        },
        refine: {
          label: 'refine',
          key: 'refine',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether refined data is reserved during index building',
          helperText:
            'If true, stores refined data for better accuracy but uses more memory',
        },
        refine_type: {
          label: 'refine_type',
          key: 'refine_type',
          type: 'text',
          description: 'The data type of the refine index',
          helperText: 'Available options: SQ6, SQ8, BF16, FP16, FP32',
        },
      },
    },
    [INDEX_TYPES_ENUM.HNSW_PQ]: {
      required: ['M', 'efConstruction', 'm', 'nbits'],
      optional: ['refine', 'refine_type'],
      params: {
        M: {
          label: 'M',
          key: 'M',
          type: 'number',
          required: true,
          min: 2,
          max: 2048,
          description: 'Maximum number of outgoing connections in the graph',
          helperText:
            'Higher M leads to higher accuracy/run_time at fixed ef/efConstruction. Must be between 2 and 2048',
        },
        efConstruction: {
          label: 'efConstruction',
          key: 'efConstruction',
          type: 'number',
          required: true,
          min: 1,
          max: 2147483647,
          description: 'Controls index search speed/build speed tradeoff',
          helperText:
            'Increasing the efConstruction parameter may enhance index quality, but it also tends to lengthen the indexing time',
        },
        m: {
          label: 'm',
          key: 'm',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          defaultValue: '32',
          description:
            'The number of sub-vector groups to split the vector into',
          helperText:
            'Must be a divisor of vector dimension. Recommended: D/2, where D is vector dimension',
        },
        nbits: {
          label: 'nbits',
          key: 'nbits',
          type: 'number',
          required: true,
          min: 1,
          max: 24,
          defaultValue: '8',
          description:
            'The number of bits into which each group of sub-vectors is quantized',
          helperText:
            'Determines codebook size (2^nbits centroids). Recommended range: [1, 16]',
        },
        refine: {
          label: 'refine',
          key: 'refine',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether refined data is reserved during index building',
          helperText:
            'If true, stores refined data for better accuracy but uses more memory',
        },
        refine_type: {
          label: 'refine_type',
          key: 'refine_type',
          type: 'text',
          description: 'The data type of the refine index',
          helperText: 'Available options: SQ6, SQ8, BF16, FP16, FP32',
        },
      },
    },
    [INDEX_TYPES_ENUM.HNSW_PRQ]: {
      required: ['M', 'efConstruction', 'm', 'nbits', 'nrq'],
      optional: ['refine', 'refine_type'],
      params: {
        M: {
          label: 'M',
          key: 'M',
          type: 'number',
          required: true,
          min: 2,
          max: 2048,
          description: 'Maximum number of outgoing connections in the graph',
          helperText:
            'Higher M leads to higher accuracy/run_time at fixed ef/efConstruction. Must be between 2 and 2048',
        },
        efConstruction: {
          label: 'efConstruction',
          key: 'efConstruction',
          type: 'number',
          required: true,
          min: 1,
          max: 2147483647,
          description: 'Controls index search speed/build speed tradeoff',
          helperText:
            'Increasing the efConstruction parameter may enhance index quality, but it also tends to lengthen the indexing time',
        },
        m: {
          label: 'm',
          key: 'm',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          defaultValue: '32',
          description:
            'The number of sub-vector groups to split the vector into',
          helperText:
            'Must be a divisor of vector dimension. Recommended: D/2, where D is vector dimension',
        },
        nbits: {
          label: 'nbits',
          key: 'nbits',
          type: 'number',
          required: true,
          min: 1,
          max: 24,
          defaultValue: '8',
          description:
            'The number of bits into which each group of sub-vectors is quantized',
          helperText:
            'Determines codebook size (2^nbits centroids). Recommended range: [1, 16]',
        },
        nrq: {
          label: 'nrq',
          key: 'nrq',
          type: 'number',
          required: true,
          min: 1,
          max: 16,
          defaultValue: '2',
          description: 'The number of residual subquantizers',
          helperText:
            'Number of complete PQ quantizations to perform on residual vectors. Higher values improve accuracy but increase index size',
        },
        refine: {
          label: 'refine',
          key: 'refine',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether refined data is reserved during index building',
          helperText:
            'If true, stores refined data for better accuracy but uses more memory',
        },
        refine_type: {
          label: 'refine_type',
          key: 'refine_type',
          type: 'text',
          description: 'The data type of the refine index',
          helperText: 'Available options: SQ6, SQ8, BF16, FP16, FP32',
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
          type: 'number',
          required: true,
          min: 1,
          max: 1024,
          defaultValue: '128',
          description: 'Graph degree before pruning',
          helperText:
            'Affects recall and build time. Recommended values: 32 or 64',
        },
        graph_degree: {
          label: 'graph_degree',
          key: 'graph_degree',
          type: 'number',
          required: true,
          min: 1,
          max: 1024,
          defaultValue: '64',
          description: 'Graph degree after pruning',
          helperText:
            'Must be smaller than intermediate_graph_degree. Affects search performance and recall',
        },
        build_algo: {
          label: 'build_algo',
          key: 'build_algo',
          type: 'text',
          required: true,
          defaultValue: 'IVF_PQ',
          description: 'Graph generation algorithm before pruning',
          helperText:
            'IVF_PQ: Higher quality but slower build time. NN_DESCENT: Quicker build with potentially lower recall',
        },
        cache_dataset_on_device: {
          label: 'cache_dataset_on_device',
          key: 'cache_dataset_on_device',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether to cache the original dataset in GPU memory',
          helperText:
            'true: Enhances recall by refining search results. false: Saves GPU memory',
        },
        adapt_for_cpu: {
          label: 'adapt_for_cpu',
          key: 'adapt_for_cpu',
          type: 'bool',
          defaultValue: 'false',
          description:
            'Whether to use GPU for index-building and CPU for search',
          helperText: 'If true, requires ef parameter in search requests',
        },
      },
    },
    [INDEX_TYPES_ENUM.GPU_IVF_FLAT]: {
      required: ['nlist'],
      optional: ['cache_dataset_on_device'],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          defaultValue: '128',
          description: 'Number of cluster units',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
        cache_dataset_on_device: {
          label: 'cache_dataset_on_device',
          key: 'cache_dataset_on_device',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether to cache the original dataset in GPU memory',
          helperText:
            'true: Enhances recall by refining search results. false: Saves GPU memory',
        },
      },
    },
    [INDEX_TYPES_ENUM.GPU_IVF_PQ]: {
      required: ['nlist', 'm'],
      optional: ['nbits', 'cache_dataset_on_device'],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          defaultValue: '128',
          description: 'Number of cluster units',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
        m: {
          label: 'm',
          key: 'm',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of factors of product quantization',
          helperText:
            'Must be a divisor of vector dimension (dim mod m == 0). Recommended: D/2, where D is vector dimension',
        },
        nbits: {
          label: 'nbits',
          key: 'nbits',
          type: 'number',
          min: 1,
          max: 16,
          defaultValue: '8',
          description:
            'Number of bits in which each low-dimensional vector is stored',
          helperText:
            'Determines codebook size (2^nbits centroids). Higher values improve accuracy but increase index size',
        },
        cache_dataset_on_device: {
          label: 'cache_dataset_on_device',
          key: 'cache_dataset_on_device',
          type: 'bool',
          defaultValue: 'false',
          description: 'Whether to cache the original dataset in GPU memory',
          helperText:
            'true: Enhances recall by refining search results. false: Saves GPU memory',
        },
      },
    },
  },
  [DataTypeEnum.BinaryVector]: {
    [INDEX_TYPES_ENUM.BIN_IVF_FLAT]: {
      required: ['nlist'],
      optional: [],
      params: {
        nlist: {
          label: 'nlist',
          key: 'nlist',
          type: 'number',
          required: true,
          min: 1,
          max: 65536,
          description: 'Number of clusters to create using k-means algorithm',
          helperText:
            'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
        },
      },
    },
  },
};
