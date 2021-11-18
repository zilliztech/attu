import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// use to test vector insert
const csvWriter = createCsvWriter({
  path: './vectors.csv',
  header: [
    { id: 'vector', title: 'vector' },
    { id: 'bool', title: 'bool' },
  ],
});

const records = [];

const generateVector = (dimension) => {
  let index = 0;
  const vectors = [];
  while (index < dimension) {
    vectors.push(1 + Math.random());
    index++;
  }
  return JSON.stringify(vectors);
};

while (records.length < 50000) {
  const value = generateVector(4);
  records.push({ vector: value, bool: records.length % 2 === 0 });
}

csvWriter
  .writeRecords(records) // returns a promise
  .then(() => {
    console.log('...Done');
  });
