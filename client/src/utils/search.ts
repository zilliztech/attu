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
