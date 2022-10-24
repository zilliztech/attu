export const VECTOR_SEARCH = {
  python: `from pymilvus import Collection
  collection = Collection("book")
  collection.load()
  results = collection.search(
    data=[[0.1, 0.2]], 
    anns_field="book_intro", 
    param=search_params, 
    limit=10, 
    expr=None,
    consistency_level="Strong"
  )
  `,

  nodejs: `await milvusClient.dataManager.search({
    collection_name: "book",
    expr: "",
    vectors: [[0.1, 0.2]],
    search_params: searchParams,
    vector_type: 101,    // DataType.FloatVector
  });
  `,
};
