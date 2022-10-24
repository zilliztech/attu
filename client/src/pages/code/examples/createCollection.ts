export const CREATE_COLLECTION = {
  python: `from pymilvus import CollectionSchema, FieldSchema, DataType
  book_id = FieldSchema(
    name="book_id", 
    dtype=DataType.INT64, 
    is_primary=True, 
  )
  book_name = FieldSchema(
    name="book_name", 
    dtype=DataType.VARCHAR, 
    max_length=200,
  )
  word_count = FieldSchema(
    name="word_count", 
    dtype=DataType.INT64,  
  )
  book_intro = FieldSchema(
    name="book_intro", 
    dtype=DataType.FLOAT_VECTOR, 
    dim=2
  )
  schema = CollectionSchema(
    fields=[book_id, book_name, word_count, book_intro], 
    description="Test book search"
  )
  collection_name = "book"
  collection = Collection(
    name=collection_name, 
    schema=schema, 
    using='default', 
    shards_num=2,
  )`,

  nodejs: `const params = {
    collection_name: "book",
    description: "Test book search"
    fields: [
      {
        name: "book_intro",
        description: "",
        data_type: 101,  // DataType.FloatVector
        type_params: {
          dim: "2",
        },
      },
    {
        name: "book_id",
        data_type: 5,   //DataType.Int64
        is_primary_key: true,
        description: "",
      },
      {
        name: "word_count",
        data_type: 5,    //DataType.Int64
        description: "",
      },
    ],
  };
  await milvusClient.collectionManager.createCollection(params);`,
};
