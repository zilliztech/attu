import { Theme } from '@mui/material';
import { useContext, useState, useEffect } from 'react';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '@/hooks';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import EditPropertyDialog from '@/pages/dialogs/EditPropertyDialog';
import ResetPropertyDialog from '@/pages/dialogs/ResetPropertyDialog';
import { rootContext } from '@/context';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { formatNumber } from '@/utils';
import { makeStyles } from '@mui/styles';
import { DatabaseService } from '@/http';
import { databaseDefaults, collectionDefaults, Property } from '@/consts';
import type { CollectionFullObject, KeyValuePair } from '@server/types';

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

const mergeProperties = (
  defaults: Property[],
  custom: KeyValuePair[] | undefined
) => {
  return custom
    ? defaults.map(i => {
        let prop = custom.find(p => p.key === i.key);
        return prop ? { ...i, ...prop } : i;
      })
    : defaults;
};

interface PropertiesProps {
  type: 'collection' | 'database';
  target?: CollectionFullObject | string;
}

const Properties = (props: PropertiesProps) => {
  const { target, type } = props;

  const classes = useStyles();
  const { t } = useTranslation('properties');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property[]>([]);
  const { setDialog, openSnackBar } = useContext(rootContext);

  // setup properties
  const setupProperties = async () => {
    let properties: Property[] = [];

    switch (type) {
      case 'collection':
        const collection = target as CollectionFullObject;
        if (!collection || !collection.schema) {
          return;
        }
        properties = mergeProperties(collectionDefaults, collection.properties);
        break;

      case 'database':
        const db = await DatabaseService.describeDatabase(target as string);
        properties = mergeProperties(databaseDefaults, db.properties);
        break;
    }

    setProperties(properties);
  };

  useEffect(() => {
    setupProperties();
  }, [type, target]);

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
                target={target!}
                type={type}
                property={selected[0]}
                cb={() => {
                  openSnackBar(
                    successTrans('update', { name: selected[0].key })
                  );
                  setupProperties();
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
                target={target!}
                type={type}
                property={selected[0]}
                cb={() => {
                  openSnackBar(
                    successTrans('reset', { name: selected[0].key })
                  );
                  setupProperties();
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
  if (!properties || properties.length === 0) {
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
