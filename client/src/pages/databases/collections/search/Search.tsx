import { useState, useEffect, useRef, useContext, ChangeEvent } from 'react';
import {
  TextField,
  Typography,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import { DataService } from '@/http';
import { useQuery } from '@/hooks';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import AttuGrid from '@/components/grid/Grid';
import Filter from '@/components/advancedSearch';
import CustomToolBar from '@/components/grid/ToolBar';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { getQueryStyles } from './Styles';
import {
  DYNAMIC_FIELD,
  DataTypeStringEnum,
  CONSISTENCY_LEVEL_OPTIONS,
  ConsistencyLevelEnum,
  TOP_K_OPTIONS,
} from '@/consts';

import CustomSelector from '@/components/customSelector/CustomSelector';
import { detectItemType } from '@/utils';
import { CollectionObject, CollectionFullObject } from '@server/types';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { formatFieldType } from '@/utils';
import SearchParams from '../../../search/SearchParams';

export interface CollectionDataProps {
  collectionName: string;
  collections: CollectionObject[];
}

const Search = (props: CollectionDataProps) => {
  // props
  const { collections } = props;
  const collection = collections.find(
    i => i.collection_name === props.collectionName
  ) as CollectionFullObject;

  // collection is not found or collection full object is not ready
  if (!collection || !collection.consistency_level) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [expression, setExpression] = useState<string>('');
  const [consistencyLevel, setConsistencyLevel] = useState<string>(
    collection.consistency_level
  );

  // collection fields, combine static and dynamic fields
  const fields = [
    ...collection.schema.fields,
    ...collection.schema.dynamicFields,
  ];

  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { fetchCollection } = useContext(dataContext);
  // icons
  const ResetIcon = icons.refresh;
  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');
  // classes
  const classes = getQueryStyles();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: ChangeEvent<{}>, expanded: boolean) => {
      setExpanded(expanded ? panel : false);
    };

  return (
    <div className={classes.root}>
      {collection && (
        <div className={classes.inputArea}>
          <div className={classes.accordions}>
            {collection.schema.vectorFields.map((field, index) => {
              return (
                <Accordion
                  key={`${collection.collection_name}-${field.name}`}
                  expanded={expanded === field.name}
                  onChange={handleChange(field.name)}
                  className={classes.accordion}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${field.name}-content`}
                    id={`${field.name}-header`}
                  >
                    <FormControlLabel
                      aria-label="Acknowledge"
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
                    <textarea
                      className="textarea"
                      placeholder={searchTrans('vectorPlaceholder')}
                      value={''}
                      onChange={(
                        e: React.ChangeEvent<{ value: unknown }>
                      ) => {}}
                    ></textarea>
                    <Typography className="text">
                      {searchTrans('thirdTip')}
                    </Typography>
                    <SearchParams
                      wrapperClass="paramsWrapper"
                      consistency_level={'Strong'}
                      handleConsistencyChange={(level: string) => {}}
                      indexType={field.index.indexType}
                      indexParams={field.index_params}
                      searchParamsForm={{}}
                      handleFormChange={() => {}}
                      topK={5}
                      setParamsDisabled={() => {
                        return false;
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>

          <div className={classes.searchControls}>
            <CustomSelector
              options={TOP_K_OPTIONS}
              value={50}
              label={collectionTrans('topK')}
              wrapperClass="selector"
              variant="filled"
              onChange={(e: { target: { value: unknown } }) => {}}
            />

            <CustomSelector
              options={CONSISTENCY_LEVEL_OPTIONS}
              value={consistencyLevel || ConsistencyLevelEnum.Bounded}
              label={collectionTrans('consistencyLevel')}
              wrapperClass="selector"
              variant="filled"
              onChange={(e: { target: { value: unknown } }) => {
                const consistency = e.target.value as string;
              }}
            />

            <CustomButton>{btnTrans('example')}</CustomButton>

            <CustomButton
              variant="contained"
              size="small"
              disabled={false}
              onClick={() => {}}
            >
              {btnTrans('search')}
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
