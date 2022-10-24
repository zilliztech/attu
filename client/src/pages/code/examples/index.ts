import { BUILD_INDEX } from './buildIndex';
import { CREATE_COLLECTION } from './createCollection';
import { INSERT_DATA } from './insertData';
import { LOAD_COLLECTION } from './loadCollection';
import { VECTOR_SEARCH } from './vectorSearch';

export const OPERATION_TYPES: { label: string; value: string }[] = [
  { label: 'Create collection', value: 'CREATE_COLLECTION' },
  { label: 'Build index', value: 'BUILD_INDEX' },
  { label: 'Load collection', value: 'LOAD_COLLECTION' },
  { label: 'Insert data', value: 'INSERT_DATA' },
  { label: 'Vector search', value: 'VECTOR_SEARCH' },
];
export const LANGS: { label: string; value: string }[] = [
  { label: 'Python', value: 'python' },
  { label: 'Nodejs', value: 'nodejs' },
];

export const EXAMPLES: { [key: string]: { [key: string]: string } } = {
  BUILD_INDEX,
  CREATE_COLLECTION,
  INSERT_DATA,
  LOAD_COLLECTION,
  VECTOR_SEARCH,
};
