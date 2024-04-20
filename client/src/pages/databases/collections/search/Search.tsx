import { useState, useEffect, useRef, useContext } from 'react';
import { TextField, Typography } from '@material-ui/core';
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
} from '@/consts';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { detectItemType } from '@/utils';
import { CollectionObject, CollectionFullObject } from '@server/types';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';

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

  return <div className={classes.root}>{collection && <div>search</div>}</div>;
};

export default Search;
