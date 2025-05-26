const indexTrans = {
  type: 'Index Type',
  param: 'Index Parameters',
  inMemory: 'In-Memory Index',
  disk: 'Disk Index',
  gpu: 'GPU Index',
  scalar: 'Scalar Index',

  create: 'Create Index',
  index: 'Index',
  noIndex: 'No Index',
  desc: 'Description',
  indexName: 'Index Name',

  creating: 'Creating Index',

  metric: 'Metric Type',
  createSuccess: 'Start creating index',
  deleteWarning:
    'You are trying to delete an index. This action cannot be undone.',
  cancelCreate: 'Cancel Index Creation',

  metricType: {
    IP: {
      description:
        'Inner Product: Measures similarity based on the dot product of vectors. Higher values indicate greater similarity.',
    },
    L2: {
      description:
        'Euclidean Distance: Measures similarity based on the straight-line distance between vectors. Lower values indicate greater similarity.',
    },
    COSINE: {
      description:
        'Cosine Similarity: Measures similarity based on the cosine of the angle between vectors. Values range from -1 to 1, with 1 indicating identical vectors.',
    },
    BM25: {
      description:
        'BM25: A ranking function used for text search, based on the probabilistic relevance framework.',
    },
  },

  params: {
    nlist: {
      description: 'Number of clusters to create using k-means algorithm',
      helperText:
        'Larger values improve recall but increase index building time. Recommended range: [32, 4096]',
    },
    nbits: {
      description: 'Number of bits for quantization',
      helperText: 'Must be between 1 and 16',
    },
    M: {
      description: 'Maximum number of outgoing connections in the graph',
      helperText:
        'Higher M leads to higher accuracy/run_time at fixed ef/efConstruction. Must be between 2 and 2048',
    },
    efConstruction: {
      description: 'Controls index search speed/build speed tradeoff',
      helperText:
        'Increasing the efConstruction parameter may enhance index quality, but it also tends to lengthen the indexing time',
    },
    m: {
      description: 'Number of factors of product quantization',
      helperText:
        'Must be a divisor of vector dimension (dim mod m == 0). Recommended: D/2, where D is vector dimension',
    },
    sq_type: {
      description: 'Scalar quantizer type',
      helperText: 'Available options: SQ6, SQ8, BF16, FP16',
    },
    refine: {
      description: 'Whether refined data is reserved during index building',
      helperText:
        'If true, stores refined data for better accuracy but uses more memory',
    },
    refine_type: {
      description: 'The data type of the refine index',
      helperText: 'Available options: SQ6, SQ8, BF16, FP16, FP32',
    },
    nrq: {
      description: 'The number of residual subquantizers',
      helperText:
        'Number of complete PQ quantizations to perform on residual vectors. Higher values improve accuracy but increase index size',
    },
    intermediate_graph_degree: {
      description: 'Graph degree before pruning',
      helperText: 'Affects recall and build time. Recommended values: 32 or 64',
    },
    graph_degree: {
      description: 'Graph degree after pruning',
      helperText:
        'Must be smaller than intermediate_graph_degree. Affects search performance and recall',
    },
    build_algo: {
      description: 'Graph generation algorithm before pruning',
      helperText:
        'IVF_PQ: Higher quality but slower build time. NN_DESCENT: Quicker build with potentially lower recall',
    },
    cache_dataset_on_device: {
      description: 'Whether to cache the original dataset in GPU memory',
      helperText:
        'true: Enhances recall by refining search results. false: Saves GPU memory',
    },
    adapt_for_cpu: {
      description: 'Whether to use GPU for index-building and CPU for search',
      helperText: 'If true, requires ef parameter in search requests',
    },
    with_raw_data: {
      description: 'Whether to store raw data',
    },
  },
};

export default indexTrans;
