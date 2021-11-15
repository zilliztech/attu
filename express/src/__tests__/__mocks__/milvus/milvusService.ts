const mockMivusService = jest.fn().mockImplementation(() => {
  return {
    connectMilvus: (address: string) => new Promise(() => !!address),
    checkConnect: (address: string) => new Promise(() => address),
    flush: (collectionName: string) => new Promise(() => collectionName),
  };
});

export default mockMivusService;
