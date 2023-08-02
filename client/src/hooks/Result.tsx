import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import { detectItemType } from '@/utils/Common';
import CopyButton from '@/components/advancedSearch/CopyButton';

export const useSearchResult = (searchResult: any[], classes: ClassNameMap) => {
  const { t: commonTrans } = useTranslation();
  const copyTrans = commonTrans('copy');

  return useMemo(
    () =>
      searchResult?.map((resultItem: { [key: string]: any }) => {
        // Iterate resultItem keys, then format vector(array) items.

        const tmp = Object.keys(resultItem).reduce(
          (prev: { [key: string]: any }, item: string) => {
            const itemType = detectItemType(resultItem[item]);

            switch (itemType) {
              case 'json':
                prev[item] = <div>{JSON.stringify(resultItem[item])}</div>;
                break;
              case 'array':
                const list2Str = JSON.stringify(resultItem[item]);
                prev[item] = (
                  <div className={classes.vectorTableCell}>
                    <div>{list2Str}</div>
                    <CopyButton
                      label={copyTrans.label}
                      value={list2Str}
                      className={classes.copyBtn}
                    />
                  </div>
                );
                break;
              default:
                prev[item] = `${resultItem[item]}`;
            }

            return prev;
          },
          {}
        );
        return tmp;
      }),
    [searchResult, classes.vectorTableCell, classes.copyBtn, copyTrans.label]
  );
};
