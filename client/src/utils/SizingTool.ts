import { SIZE_STATUS } from '../pages/schema/Types';
import { INDEX_TYPES_ENUM } from '@/consts';

const commonValueCalculator = (
  vector: number,
  dimensions: number,
  nlistArg: number,
  fileSize: number
) => {
  const vectorCount = Math.min(fileSize / (dimensions * 4), vector);
  const segmentCount = Math.round(vector / vectorCount);
  const nlist = Math.min(nlistArg, vectorCount / 40);
  return {
    vectorCount,
    segmentCount,
    nlist,
  };
};

const pqCalculator = (
  vectorCount: number,
  segmentCount: number,
  dimensions: number,
  m: number,
  nlist: number
) => {
  const singleDiskSize =
    nlist * dimensions * 4 + m * vectorCount + 256 * dimensions * 4;
  const singleMemorySize = singleDiskSize + 256 * m * nlist * 4;
  return {
    pq_diskSize: singleDiskSize * segmentCount,
    pq_memorySize: singleMemorySize * segmentCount,
  };
};

export const computMilvusRecommonds = (
  vector: number,
  dimensions: number,
  nlistArg: number,
  m: number,
  fileSize: number
): { [key in string]: any } => {
  const { vectorCount, segmentCount, nlist } = commonValueCalculator(
    vector,
    dimensions,
    nlistArg,
    fileSize
  );

  const { pq_diskSize, pq_memorySize } = pqCalculator(
    vectorCount,
    segmentCount,
    dimensions,
    m,
    nlist
  );

  const size = vector * dimensions * 4;
  const nlistSize = dimensions * 4 * nlist;
  const byteSize = (dimensions / 8) * vector;

  const rawFileSize = {
    [INDEX_TYPES_ENUM.FLAT]: size,
    [INDEX_TYPES_ENUM.IVF_FLAT]: size,
    [INDEX_TYPES_ENUM.IVF_SQ8]: size,
    [INDEX_TYPES_ENUM.IVF_SQ8_HYBRID]: size,
    [INDEX_TYPES_ENUM.IVF_PQ]: size,
  };

  const memorySize = {
    [INDEX_TYPES_ENUM.FLAT]: size,
    [INDEX_TYPES_ENUM.IVF_FLAT]: size + nlistSize * segmentCount,
    [INDEX_TYPES_ENUM.IVF_SQ8]: size * 0.25 + nlistSize * segmentCount,
    [INDEX_TYPES_ENUM.IVF_SQ8_HYBRID]: size * 0.25 + nlistSize * segmentCount,
    [INDEX_TYPES_ENUM.IVF_PQ]: pq_memorySize,
  };

  const diskSize = {
    [INDEX_TYPES_ENUM.FLAT]: size,
    [INDEX_TYPES_ENUM.IVF_FLAT]:
      rawFileSize[INDEX_TYPES_ENUM.IVF_FLAT] +
      memorySize[INDEX_TYPES_ENUM.IVF_FLAT],
    [INDEX_TYPES_ENUM.IVF_SQ8]:
      rawFileSize[INDEX_TYPES_ENUM.IVF_SQ8] +
      memorySize[INDEX_TYPES_ENUM.IVF_SQ8],
    [INDEX_TYPES_ENUM.IVF_SQ8_HYBRID]:
      rawFileSize[INDEX_TYPES_ENUM.IVF_SQ8_HYBRID] +
      memorySize[INDEX_TYPES_ENUM.IVF_SQ8_HYBRID],
    [INDEX_TYPES_ENUM.IVF_PQ]:
      rawFileSize[INDEX_TYPES_ENUM.IVF_PQ] + pq_diskSize,
  };

  const byteRawFileSize = {
    [INDEX_TYPES_ENUM.BIN_FLAT]: byteSize,
    [INDEX_TYPES_ENUM.BIN_IVF_FLAT]: byteSize,
  };

  const byteMemorySize = {
    [INDEX_TYPES_ENUM.BIN_FLAT]: byteSize,
    [INDEX_TYPES_ENUM.BIN_IVF_FLAT]: dimensions * nlist + byteSize,
  };

  const byteDiskSize = {
    [INDEX_TYPES_ENUM.BIN_FLAT]: byteSize,
    [INDEX_TYPES_ENUM.BIN_IVF_FLAT]:
      byteRawFileSize[INDEX_TYPES_ENUM.BIN_IVF_FLAT] +
      byteMemorySize[INDEX_TYPES_ENUM.BIN_IVF_FLAT],
  };

  return {
    rawFileSize,
    memorySize,
    diskSize,
    byteRawFileSize,
    byteMemorySize,
    byteDiskSize,
  };
};

export const formatSize = (size: number) => {
  // 1:B, 2:KB, 3:MB, 4:GB, 5:TB
  let sizeStatus = 1;
  let status = 'BYTE';
  while (sizeStatus < 4 && size > 1024) {
    size = size / 1024;
    sizeStatus++;
  }
  status = SIZE_STATUS[sizeStatus] ?? 'KB';

  size = Math.ceil(size);

  return `${size} ${status}`;
};
