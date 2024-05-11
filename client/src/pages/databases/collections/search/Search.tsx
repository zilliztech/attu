import {
  useState,
  useEffect,
  useRef,
  useContext,
  ChangeEvent,
  useCallback,
} from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import { DataService } from '@/http';
import icons from '@/components/icons/Icons';
import AttuGrid from '@/components/grid/Grid';
import Filter from '@/components/advancedSearch';
import CustomToolBar from '@/components/grid/ToolBar';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { getQueryStyles } from './Styles';
import SearchGlobalParams from './SearchGlobalParams';
import VectorInputBox from './VectorInputBox';
import {
  CollectionObject,
  CollectionFullObject,
  FieldObject,
} from '@server/types';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { formatFieldType } from '@/utils';
import SearchParams from '../../../search/SearchParams';
import {
  SearchParams as SearchParamsType,
  SearchSingleParams,
} from '../../types';
import { cloneObj, generateVector, transformObjToStr } from '@/utils';
import { DataTypeStringEnum } from '@/consts';

export interface CollectionDataProps {
  collectionName: string;
  collections: CollectionObject[];
  searchParams: SearchParamsType;
  setSearchParams: any;
}

export const generateVectorsByField = (field: FieldObject) => {
  switch (field.data_type) {
    case DataTypeStringEnum.FloatVector:
    case DataTypeStringEnum.BinaryVector:
    case DataTypeStringEnum.Float16Vector:
    case DataTypeStringEnum.BFloat16Vector:
      return JSON.stringify(generateVector(field.dimension));
    case 'SparseFloatVector':
      return transformObjToStr({
        [Math.floor(Math.random() * 10)]: Math.random(),
      });
    default:
      return [1, 2, 3];
  }
};

const Search = (props: CollectionDataProps) => {
  // props
  const { collections, collectionName, searchParams, setSearchParams } = props;
  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  // icons
  const ResetIcon = icons.refresh;
  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: warningTrans } = useTranslation('warning');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');
  // classes
  const classes = getQueryStyles();

  // UI functions
  const handleExpand =
    (panel: string) => (event: ChangeEvent<{}>, expanded: boolean) => {
      const s = cloneObj(searchParams);
      const target = s.searchParams.find((sp: SearchSingleParams) => {
        return sp.field.name === panel;
      });

      if (target) {
        target.expanded = expanded;
        setSearchParams({ ...s });
      }
    };

  // update search params
  const updateSearchParamCallback = useCallback(
    (updates: SearchSingleParams, index: number) => {
      if (
        JSON.stringify(updates) !==
        JSON.stringify(searchParams.searchParams[index].params)
      ) {
        const s = cloneObj(searchParams);
        // update the searchParams
        s.searchParams[index].params = updates;
        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  // execute search
  const executeSearch = useCallback(() => {
    console.log('executeSearch', searchParams);
  }, [JSON.stringify(searchParams)]);

  // generate vectors
  const executeGenerateVectors = useCallback(() => {
    const s = cloneObj(searchParams) as SearchParamsType;
    s.searchParams.forEach((sp: SearchSingleParams) => {
      sp.data = generateVectorsByField(sp.field) as any;
    });

    setSearchParams({ ...s });
  }, [JSON.stringify(searchParams)]);

  const onVectorInputChange = useCallback(
    (anns_field: string, value: string) => {
      const s = cloneObj(searchParams) as SearchParamsType;
      const target = s.searchParams.find((sp: SearchSingleParams) => {
        return sp.anns_field === anns_field;
      });

      if (value !== target!.data) {
        target!.data = value;
        setSearchParams({ ...s });
      }
    },
    [JSON.stringify(searchParams)]
  );

  // collection is not found or collection full object is not ready
  if (searchParams && searchParams.searchParams.length === 0) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  return (
    <div className={classes.root}>
      {collection && (
        <div className={classes.inputArea}>
          <div className={classes.accordions}>
            {searchParams.searchParams.map((s, index: number) => {
              const field = s.field;
              // console.log('update', s.params, searchParams.globalParams);
              return (
                <Accordion
                  key={`${collection.collection_name}-${field.name}`}
                  expanded={s.expanded}
                  onChange={handleExpand(field.name)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${field.name}-content`}
                    id={`${field.name}-header`}
                  >
                    <FormControlLabel
                      onClick={event => event.stopPropagation()}
                      onFocus={event => event.stopPropagation()}
                      control={<Checkbox size="small" />}
                      label={field.name} //  formatFieldType(field)
                      className={classes.checkbox}
                    />
                    <Typography className={classes.secondaryHeading}>
                      {formatFieldType(field)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className={classes.accordionDetail}>
                    <VectorInputBox
                      searchParams={s}
                      onChange={onVectorInputChange}
                    />
                    <Typography className="text">
                      {searchTrans('thirdTip')}
                    </Typography>

                    <SearchParams
                      wrapperClass="paramsWrapper"
                      consistency_level={'Strong'}
                      handleConsistencyChange={(level: string) => {}}
                      indexType={field.index.indexType}
                      indexParams={field.index_params}
                      searchParamsForm={s.params}
                      handleFormChange={(
                        updates: { [key in string]: number | string }
                      ) => {
                        updateSearchParamCallback(updates as any, index);
                      }}
                      topK={searchParams.globalParams.topK}
                      setParamsDisabled={() => {
                        return false;
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>

          <SearchGlobalParams
            searchParamsForm={searchParams.globalParams}
            handleFormChange={(params: any) => {
              searchParams.globalParams = params;
              setSearchParams({ ...searchParams });
            }}
            executeGenerateVectors={executeGenerateVectors}
            executeSearch={executeSearch}
          />
        </div>
      )}
    </div>
  );
};

export default Search;
