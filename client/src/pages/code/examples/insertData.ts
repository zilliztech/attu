export const INSERT_DATA = {
  python: `import random
  data = [
    [i for i in range(2000)],
    [str(i) for i in range(2000)],
    [i for i in range(10000, 12000)],
    [[random.random() for _ in range(2)] for _ in range(2000)],
  ]
  from pymilvus import Collection
  collection = Collection("book")
  mr = collection.insert(data)
  `,

  nodejs: `const data = Array.from({ length: 2000 }, (v,k) => ({
    "book_id": k,
    "word_count": k+10000,
    "book_intro": Array.from({ length: 2 }, () => Math.random()),
  }));
  await milvusClient.dataManager.insert({
    collection_name: "book",
    fields_data: data,
  });
  `,
};
