import { makeStyles, Theme } from '@material-ui/core';
import { FC, useState } from 'react';
import { PartitionView } from './Types';
import MilvusGrid from '../../components/grid';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {},
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
}));

const Partitions: FC<{ data: PartitionView[]; loading: boolean }> = ({
  data,
  loading,
}) => {
  const classes = useStyles();
  const { t } = useTranslation('partition');
  const InfoIcon = icons.info;
  console.log('==== data', data, 'loading', loading);

  const {
    pageSize,
    currentPage,
    handleCurrentPage,
    // offset,
    total,
    // setTotal
  } = usePaginationHook();

  const [selectedPartitions, setSelectedPartitions] = useState<PartitionView[]>(
    []
  );

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: t('create'),
      onClick: () => {},
      icon: 'add',
    },
    {
      type: 'iconBtn',
      onClick: () => {},
      label: t('delete'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: '_id',
      align: 'left',
      disablePadding: true,
      label: t('id'),
    },
    {
      id: '_name',
      align: 'left',
      disablePadding: false,
      label: t('name'),
    },
    {
      id: '_statusElement',
      align: 'left',
      disablePadding: false,
      label: t('status'),
    },
    {
      id: '_rowCount',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {t('rowCount')}
          <CustomToolTip title={t('tooltip')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },
  ];

  const handleSelectChange = (value: PartitionView[]) => {
    setSelectedPartitions(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedPartitions([]);
  };

  return (
    <section className={classes.wrapper}>
      <MilvusGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={data}
        rowCount={total}
        primaryKey="id"
        openCheckBox={true}
        showHoverStyle={true}
        selected={selectedPartitions}
        setSelected={handleSelectChange}
        page={currentPage}
        onChangePage={handlePageChange}
        rowsPerPage={pageSize}
        isLoading={loading}
      />
    </section>
  );
};

export default Partitions;
