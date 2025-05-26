const indexTrans = {
  type: '索引类型',
  param: '索引参数',
  inMemory: '内存索引',
  disk: '磁盘索引',
  gpu: 'GPU索引',
  scalar: '标量索引',

  create: '创建索引',
  index: '索引',
  noIndex: '没有索引',
  desc: '描述',
  indexName: '索引名称',

  creating: '正在创建索引',

  metric: '度量类型',
  createSuccess: '开始创建索引',
  deleteWarning: '您正在尝试删除一个索引。此操作无法撤销。',
  cancelCreate: '取消创建索引',

  metricType: {
    type: '度量类型',
    IP: {
      description: '内积：基于向量点积的相似度度量。值越大表示相似度越高。',
    },
    L2: {
      description:
        '欧氏距离：基于向量间直线距离的相似度度量。值越小表示相似度越高。',
    },
    COSINE: {
      description:
        '余弦相似度：基于向量间夹角余弦的相似度度量。取值范围为-1到1，1表示向量完全相同。',
    },
    BM25: {
      description: 'BM25：基于概率相关性框架的文本搜索排序函数。',
    },
  },

  params: {
    nlist: {
      description: '使用k-means算法创建的聚类数量',
      helperText:
        '较大的值可以提高召回率但会增加索引构建时间。推荐范围：[32, 4096]',
    },
    nbits: {
      description: '量化位数',
      helperText: '必须在1到16之间',
    },
    M: {
      description: '图中最大出边数量',
      helperText:
        '在固定的ef/efConstruction下，较大的M值会提高准确率/运行时间。必须在2到2048之间',
    },
    efConstruction: {
      description: '控制索引搜索速度/构建速度的权衡',
      helperText:
        '增加efConstruction参数可能会提高索引质量，但也会延长索引构建时间',
    },
    m: {
      description: '乘积量化的因子数量',
      helperText:
        '必须是向量维度的除数（dim mod m == 0）。推荐值：D/2，其中D是向量维度',
    },
    sq_type: {
      description: '标量量化器类型',
      helperText: '可用选项：SQ6, SQ8, BF16, FP16',
    },
    refine: {
      description: '是否在索引构建期间保留精炼数据',
      helperText: '如果为true，存储精炼数据以提高准确率但会使用更多内存',
    },
    refine_type: {
      description: '精炼索引的数据类型',
      helperText: '可用选项：SQ6, SQ8, BF16, FP16, FP32',
    },
    nrq: {
      description: '残差子量化器数量',
      helperText:
        '对残差向量执行的完整PQ量化数量。较高的值会提高准确率但会增加索引大小',
    },
    intermediate_graph_degree: {
      description: '剪枝前的图度数',
      helperText: '影响召回率和构建时间。推荐值：32或64',
    },
    graph_degree: {
      description: '剪枝后的图度数',
      helperText: '必须小于intermediate_graph_degree。影响搜索性能和召回率',
    },
    build_algo: {
      description: '剪枝前的图生成算法',
      helperText:
        'IVF_PQ：更高质量但构建时间较慢。NN_DESCENT：构建更快但召回率可能较低',
    },
    cache_dataset_on_device: {
      description: '是否在GPU内存中缓存原始数据集',
      helperText: 'true：通过精炼搜索结果提高召回率。false：节省GPU内存',
    },
    adapt_for_cpu: {
      description: '是否使用GPU构建索引并使用CPU搜索',
      helperText: '如果为true，需要在搜索请求中提供ef参数',
    },
    with_raw_data: {
      description: '是否存储原始数据',
    },
  },
};

export default indexTrans;
