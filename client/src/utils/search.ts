import { EmbeddingTypeEnum } from '../consts/Milvus';
import { DataType } from '../pages/collections/Types';
import { IndexType, INDEX_TYPES_ENUM } from '../pages/schema/Types';
import { SearchResult, SearchResultView } from '../pages/seach/Types';

export const transferSearchResult = (
  result: SearchResult[]
): SearchResultView[] => {
  const resultView = result
    .sort((a, b) => a.score - b.score)
    .map((r, index) => ({
      rank: index + 1,
      distance: r.score,
      ...r,
    }));

  return resultView;
};

/**
 * function to get EmbeddingType
 * @param fieldType only vector type fields: 'BinaryVector' or 'FloatVector'
 * @returns 'FLOAT_INDEX' or 'BINARY_INDEX'
 */
export const getEmbeddingType = (fieldType: DataType): EmbeddingTypeEnum => {
  const type =
    fieldType === 'BinaryVector'
      ? EmbeddingTypeEnum.binary
      : EmbeddingTypeEnum.float;
  return type;
};

/**
 * function to get default index type according to embedding type
 * use FLAT as default float index type, BIN_FLAT as default binary index type
 * @param embeddingType float or binary
 * @returns index type
 */
export const getDefaultIndexType = (
  embeddingType: EmbeddingTypeEnum
): IndexType => {
  const defaultIndexType =
    embeddingType === EmbeddingTypeEnum.float
      ? INDEX_TYPES_ENUM.FLAT
      : INDEX_TYPES_ENUM.BIN_FLAT;
  return defaultIndexType;
};
