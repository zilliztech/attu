import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// use to test vector insert
const csvWriter = createCsvWriter({
  path: './vectors.csv',
  header: [{ id: 'vector', title: 'vector' }],
});

const records: any[] = [];

const generateVector = (dimension: number) => {
  let index = 0;
  const vectors: any[] = [];
  while (index < dimension) {
    vectors.push(1 + Math.random());
    index++;
  }
  return JSON.stringify(vectors);
};

while (records.length < 1000) {
  const value = generateVector(960);
  records.push({
    vector: value,
    // name: `${records.length}_id`,
    // age: records.length * 2,
    // job: Math.random() * 1000 > 500 ? 'designer' : 'programer',
  });
}

csvWriter
  .writeRecords(records) // returns a promise
  .then(() => {
    console.log('...Done');
  });
