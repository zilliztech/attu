export const BUILD_INDEX = {
  python: `from pymilvus import Collection
  index_params = {
    "metric_type":"L2",
    "index_type":"IVF_FLAT",
    "params":{"nlist":1024}
  }
  collection = Collection("book")
  collection.create_index(
  field_name="book_intro", 
  index_params=index_params
  )
  `,

  nodejs: `const index_params = {
    metric_type: "L2",
    index_type: "IVF_FLAT",
    params: JSON.stringify({ nlist: 1024 }),
  };
  await milvusClient.indexManager.createIndex({
    collection_name: "book",
    field_name: "book_intro",
    extra_params: index_params,
  });`,
};
