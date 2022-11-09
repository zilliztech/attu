export const LOAD_COLLECTION = {
  python: `from pymilvus import Collection
collection = Collection("book")
collection.load(replica_number=1)`,

  nodejs: `await milvusClient.collectionManager.loadCollection({
  collection_name: "book",
});`,
};
