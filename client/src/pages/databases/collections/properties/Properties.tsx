import { makeStyles, Theme } from '@material-ui/core';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '@/hooks';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { rootContext } from '@/context';
import { getLabelDisplayedRows } from '@/pages/search/Utils';

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

type Properties = { key: string; value: any; desc: string };

let defaults: Properties[] = [
  { key: 'collection.ttl.seconds', value: '', desc: '' },
  { key: 'collection.autocompaction.enabled', value: '', desc: '' },
  { key: 'collection.insertRate.max.mb', value: '', desc: '' },
  { key: 'collection.insertRate.min.mb', value: '', desc: '' },
  { key: 'collection.upsertRate.max.mb', value: '', desc: '' },
  { key: 'collection.upsertRate.min.mb', value: '', desc: '' },
  { key: 'collection.deleteRate.max.mb', value: '', desc: '' },
  { key: 'collection.deleteRate.min.mb', value: '', desc: '' },
  { key: 'collection.bulkLoadRate.max.mb', value: '', desc: '' },
  { key: 'collection.bulkLoadRate.min.mb', value: '', desc: '' },
  { key: 'collection.queryRate.max.qps', value: '', desc: '' },
  { key: 'collection.queryRate.min.qps', value: '', desc: '' },
  { key: 'collection.searchRate.max.vps', value: '', desc: '' },
  { key: 'collection.searchRate.min.vps', value: '', desc: '' },
  { key: 'collection.diskProtection.diskQuota.mb', value: '', desc: '' },
  { key: 'partition.diskProtection.diskQuota.mb', value: '', desc: '' },
  { key: 'mmap.enabled', value: '', desc: '' },
  { key: 'lazyload.enabled', value: '', desc: '' },
];

const Properties = () => {
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = useStyles();
  const { t } = useTranslation('properties');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const [selected, setSelected] = useState<Properties[]>([]);
  const [properties, setProperties] = useState<Properties[]>(defaults);
  const { setDialog, openSnackBar } = useContext(rootContext);

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

  // on delete
  const onDelete = () => {
    openSnackBar(successTrans('delete', { name: t('partition') }));
  };

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
            component: <></>,
          },
        });
      },
      label: btnTrans('edit'),
      disabled: () => selected.length === 0,
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'key',
      sortType: 'string',
      align: 'left',
      disablePadding: true,
      sortBy: 'key',
      label: t('property'),
      needCopy: true,
    },

    {
      id: 'value',
      align: 'left',
      disablePadding: false,
      label: t('value'),
      formatter: (obj: Properties) => {
        if (obj.value === '') {
          return '-';
        }
      },
    },
    {
      id: 'desc',
      align: 'left',
      disablePadding: false,
      label: t('description'),
      formatter: (obj: Properties) => {
        if (obj.desc === '') {
          return '-';
        }
      },
    },
  ];

  const handleSelectChange = (value: Properties[]) => {
    setSelected(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelected([]);
  };

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
