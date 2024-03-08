import { CollectionObject } from '../types';

/**
 * Check collection is loading or not
 */
export const checkLoading = (v: CollectionObject): boolean => {
  return (
    typeof v.loadedPercentage !== 'undefined' &&
    v.loadedPercentage !== -1 &&
    v.loadedPercentage !== 100
  );
};

/**
 * Check collection is index building or not.
 * @param v
 * @returns boolean
 */
export const checkIndexing = (v: CollectionObject): boolean => {
  return Boolean(
    v.schema &&
      v.schema?.fields.some(field => field.index?.state === 'InProgress')
  );
};
