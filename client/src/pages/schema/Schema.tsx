import { makeStyles, Theme, Typography, Chip } from '@material-ui/core';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '@/hooks';
import icons from '@/components/icons/Icons';
import { formatFieldType } from '@/utils';
import { Collection, FieldHttp } from '@/http';
import IndexTypeElement from './IndexTypeElement';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
  iconTitle: {
    fontSize: '8px',
    position: 'relative',
    top: '3px',
    color: 'grey',
  },
  chip: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  nameWrapper: {
    display: 'flex',
    alignItems: 'center',

    '& .key': {
      width: '16px',
      height: '16px',
      marginLeft: theme.spacing(0.5),
    },
  },

  paramWrapper: {
    // set min width to prevent other table cell stretching
    minWidth: 180,

    '& .param': {
      marginRight: theme.spacing(2),

      '& .key': {
        color: theme.palette.attuGrey.dark,
        display: 'inline-block',
        marginRight: theme.spacing(0.5),
      },

      '& .value': {
        color: theme.palette.attuDark.main,
      },
    },
  },
}));

const Schema = () => {
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');

  const [fields, setFields] = useState<FieldHttp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const KeyIcon = icons.key;

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: schemaList,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(fields);

  const fetchFields = useCallback(
    async (collectionName: string) => {
      try {
        const collection = await Collection.getCollectionWithIndexInfo(
          collectionName
        );

        // add custom fields
        const fields = collection.fieldWithIndexInfo.map(f =>
          Object.assign(f, {
            _fieldNameElement: f,
            _fieldTypeElement: f,
            _indexParamElement: f,
            _indexTypeElement: f,
          })
        );

        setFields(fields);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        throw err;
      }
    },
    [classes.nameWrapper, classes.paramWrapper]
  );

  useEffect(() => {
    fetchFields(collectionName);
  }, [collectionName, fetchFields]);

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: '_fieldNameElement',
      align: 'left',
      disablePadding: true,
      formatter(f) {
        return (
          <div className={classes.nameWrapper}>
            {f.name}
            {f.isPrimaryKey ? (
              <div
                className={classes.iconTitle}
                title={collectionTrans('idFieldName')}
              >
                <KeyIcon classes={{ root: 'key' }} />
              </div>
            ) : null}
            {f.is_partition_key ? (
              <Chip
                className={classes.chip}
                size="small"
                label="Partition key"
                variant="outlined"
              />
            ) : null}
            {f.autoID ? (
              <Chip
                className={classes.chip}
                size="small"
                label="auto id"
                variant="outlined"
              />
            ) : null}
          </div>
        );
      },
      label: collectionTrans('fieldName'),
      sortBy: 'name',
    },
    {
      id: '_fieldTypeElement',
      align: 'left',
      disablePadding: false,
      formatter(f) {
        return formatFieldType(f);
      },
      label: collectionTrans('fieldType'),
    },
    {
      id: 'indexName',
      align: 'left',
      disablePadding: true,
      label: indexTrans('indexName'),
    },
    {
      id: '_indexTypeElement',
      align: 'left',
      disablePadding: true,
      label: indexTrans('type'),
      sortBy: 'indexType',
      formatter(f) {
        return (
          <IndexTypeElement
            data={f}
            collectionName={collectionName}
            cb={fetchFields}
          />
        );
      },
    },
    {
      id: '_indexParamElement',
      align: 'left',
      disablePadding: false,
      label: indexTrans('param'),
      notSort: true,
      formatter(f) {
        return (
          <div className={classes.paramWrapper}>
            {f.indexParameterPairs?.length > 0 ? (
              f.indexParameterPairs.map((p: any) =>
                p.value ? (
                  <>
                    <span key={p.key + p.value} className="param">
                      <Typography variant="body1" className="key">
                        {`${p.key}:`}
                      </Typography>
                      <Typography variant="body1" className="value">
                        {p.value}
                      </Typography>
                    </span>
                  </>
                ) : (
                  ''
                )
              )
            ) : (
              <>--</>
            )}
          </div>
        );
      },
    },
    {
      id: 'desc',
      align: 'left',
      disablePadding: false,
      label: indexTrans('desc'),
    },
  ];

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  return (
    <section className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={[]}
        colDefinitions={colDefinitions}
        rows={schemaList}
        rowCount={total}
        primaryKey="fieldID"
        showHoverStyle={false}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        openCheckBox={false}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
      />
    </section>
  );
};

export default Schema;
