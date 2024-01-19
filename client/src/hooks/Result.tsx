import { useMemo } from 'react';
import { detectItemType } from '@/utils';

export const useSearchResult = (searchResult: any[]) => {
  return useMemo(
    () =>
      searchResult?.map((resultItem: { [key: string]: any }) => {
        const tmp = Object.keys(resultItem).reduce(
          (prev: { [key: string]: any }, item: string) => {
            const itemType = detectItemType(resultItem[item]);

            switch (itemType) {
              case 'json':
              case 'array':
              case 'bool':
                prev[item] = JSON.stringify(resultItem[item]);
                break;
              default:
                prev[item] = resultItem[item];
            }

            return prev;
          },
          {}
        );
        return tmp;
      }),
    [searchResult]
  );
};
