import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// use to test vector insert
const csvWriter = createCsvWriter({
  path: './vectors.csv',
  header: [
    { id: 'vector', title: 'vector' },
    { id: 'name', title: 'name' },
    { id: 'age', title: 'age' },
    { id: 'job', title: 'job' },
  ],
});

const records = [];

const generateVector = (dimension: number) => {
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
  records.push({
    vector: value,
    name: `${records.length}_id`,
    age: records.length * 2,
    job: Math.random() * 1000 > 500 ? 'designer' : 'programer',
  });
}

csvWriter
  .writeRecords(records) // returns a promise
  .then(() => {
    console.log('...Done');
  });
