export const VECTOR_SEARCH = {
  python: `from pymilvus import Collection
collection = Collection("book")
collection.load()
search_params = {}
results = collection.search(
  data=[[0.1, 0.2]], 
  anns_field="book_intro", 
  param=search_params, 
  limit=10, 
  expr=None,
  consistency_level="Strong"
)
print(results)
`,

  nodejs: 
`const searchParams = {
  anns_field: "book_intro",
  topk: "2",
  metric_type: "L2",
  params: JSON.stringify({ nprobe: 10 }),
};

const res = await milvusClient.dataManager.search({
  collection_name: "book",
  expr: "",
  vectors: [[0.1, 0.2]],
  search_params: searchParams,
  vector_type: 101,    // DataType.FloatVector
});
console.log(res.results)
`,
};