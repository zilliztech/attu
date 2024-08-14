import { Theme } from '@mui/material';
import { useContext, useState } from 'react';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '@/hooks';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import EditPropertyDialog from '@/pages/dialogs/EditPropertyDialog';
import ResetPropertyDialog from '@/pages/dialogs/ResetPropertyDialog';
import { rootContext } from '@/context';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { CollectionFullObject } from '@server/types';
import { formatNumber } from '@/utils';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `100%`,
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

export type Property = { key: string; value: any; desc: string; type: string };

let defaults: Property[] = [
  { key: 'collection.ttl.seconds', value: '', desc: '', type: 'number' },
  {
    key: 'collection.autocompaction.enabled',
    value: '',
    desc: '',
    type: 'boolean',
  },
  { key: 'collection.insertRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.insertRate.min.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.upsertRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.upsertRate.min.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.deleteRate.max.mb', value: '', desc: '', type: 'number' },
  { key: 'collection.deleteRate.min.mb', value: '', desc: '', type: 'number' },
  {
    key: 'collection.bulkLoadRate.max.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  {
    key: 'collection.bulkLoadRate.min.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  { key: 'collection.queryRate.max.qps', value: '', desc: '', type: 'number' },
  { key: 'collection.queryRate.min.qps', value: '', desc: '', type: 'number' },
  { key: 'collection.searchRate.max.vps', value: '', desc: '', type: 'number' },
  { key: 'collection.searchRate.min.vps', value: '', desc: '', type: 'number' },
  {
    key: 'collection.diskProtection.diskQuota.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  {
    key: 'partition.diskProtection.diskQuota.mb',
    value: '',
    desc: '',
    type: 'number',
  },
  { key: 'mmap.enabled', value: '', desc: '', type: 'boolean' },
  { key: 'lazyload.enabled', value: '', desc: '', type: 'boolean' },
];

interface PropertiesProps {
  collection: CollectionFullObject;
}

const Properties = (props: PropertiesProps) => {
  const { collection } = props;

  const classes = useStyles();
  const { t } = useTranslation('properties');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const [selected, setSelected] = useState<Property[]>([]);
  const { setDialog, openSnackBar } = useContext(rootContext);

  // combine default properties with collection properties
  let properties: Property[] = collection
    ? defaults.map(i => {
        let prop = collection.properties.find(p => p.key === i.key);
        if (prop) {
          return { ...i, ...prop };
        } else {
          return i;
        }
      })
    : defaults;

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(properties);

  const toolbarConfigs: ToolBarConfig[] = [
    {
      icon: 'edit',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <EditPropertyDialog
                collection={collection}
                property={selected[0]}
                cb={() => {
                  openSnackBar(
                    successTrans('update', { name: selected[0].key })
                  );
                }}
              />
            ),
          },
        });
      },
      label: btnTrans('edit'),
      disabled: () => selected.length === 0,
    },
    {
      icon: 'reset',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <ResetPropertyDialog
                collection={collection}
                property={selected[0]}
                cb={() => {
                  openSnackBar(
                    successTrans('reset', { name: selected[0].key })
                  );
                }}
              />
            ),
          },
        });
      },
      label: btnTrans('reset'),
      disabled: () => selected.length === 0,
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'key',
      notSort: true,
      align: 'left',
      disablePadding: false,
      label: t('property'),
      needCopy: true,
      getStyle: () => {
        return {
          minWidth: 150,
        };
      },
    },
    {
      id: 'value',
      align: 'left',
      disablePadding: false,
      label: t('value'),
      formatter: (obj: Property) => {
        if (obj.value === '') {
          return '-';
        } else {
          return obj.type === 'number' ? formatNumber(obj.value) : obj.value;
        }
      },
      getStyle: () => {
        return {
          minWidth: 450,
        };
      },
    },
  ];

  const handleSelectChange = (value: Property[]) => {
    // only select one row, filter out the rest
    if (value.length > 1) {
      value = [value[value.length - 1]];
    }
    setSelected(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelected([]);
  };

  // collection is not found or collection full object is not ready
  if (!collection || !collection.schema) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  return (
    <section className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={data}
        rowCount={total}
        primaryKey="key"
        selected={selected}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={false}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
        labelDisplayedRows={getLabelDisplayedRows(
          gridTrans[data.length > 1 ? 'properties' : 'property']
        )}
      />
    </section>
  );
};

export default Properties;
