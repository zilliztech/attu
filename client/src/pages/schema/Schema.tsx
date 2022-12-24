import { makeStyles, Theme, Typography } from '@material-ui/core';
import { FC, useCallback, useEffect, useState } from 'react';
import AttuGrid from '../../components/grid/Grid';
import { ColDefinitionsType } from '../../components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { FieldHttp } from '../../http/Field';
import { FieldView } from './Types';
import IndexTypeElement from './IndexTypeElement';
import { IndexHttp } from '../../http/Index';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
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

const Schema: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');
  const InfoIcon = icons.info;

  const [fields, setFields] = useState<FieldView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchSchemaListWithIndex = async (
    collectionName: string
  ): Promise<FieldView[]> => {
    const indexList = await IndexHttp.getIndexInfo(collectionName);
    const schemaList = await FieldHttp.getFields(collectionName);
    let fields: FieldView[] = [];
    for (const schema of schemaList) {
      let field: FieldView = Object.assign(schema, {
        _indexParameterPairs: [],
        _indexType: '',
        _indexName: '',
      });
      const index = indexList.find(i => i._fieldName === schema.name);
      field._indexParameterPairs = index?._indexParameterPairs || [];
      field._indexType = index?._indexType || '';
      field._indexName = index?._indexName || '';

      fields = [...fields, field];
    }
    return fields;
  };

  const fetchFields = useCallback(
    async (collectionName: string) => {
      const KeyIcon = icons.key;

      try {
        const list = await fetchSchemaListWithIndex(collectionName);
        const fields: FieldView[] = list.map(f =>
          Object.assign(f, {
            _fieldNameElement: (
              <div className={classes.nameWrapper}>
                {f._fieldName}
                {f._isPrimaryKey && <KeyIcon classes={{ root: 'key' }} />}
              </div>
            ),
            _indexParamElement: (
              <div className={classes.paramWrapper}>
                {f._indexParameterPairs?.length > 0 ? (
                  f._indexParameterPairs.map(p => (
                    <span key={p.key} className="param">
                      <Typography variant="body1" className="key">
                        {`${p.key}:`}
                      </Typography>
                      <Typography variant="body1" className="value">
                        {p.value}
                      </Typography>
                    </span>
                  ))
                ) : (
                  <>--</>
                )}
              </div>
            ),
            _indexTypeElement: (
              <IndexTypeElement
                data={f}
                collectionName={collectionName}
                cb={fetchFields}
              />
            ),
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
      label: collectionTrans('fieldName'),
      sortBy: '_fieldName',
    },
    {
      id: '_fieldType',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('fieldType'),
    },
    {
      id: '_dimension',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {collectionTrans('dimension')}
          <CustomToolTip title={collectionTrans('dimensionTooltip')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },
    {
      id: '_maxLength',
      align: 'left',
      disablePadding: true,
      label: collectionTrans('maxLength'),
    },
    {
      id: '_indexName',
      align: 'left',
      disablePadding: true,
      label: 'Index name',
    },
    {
      id: '_indexTypeElement',
      align: 'left',
      disablePadding: true,
      label: indexTrans('type'),
      sortBy: '_indexType',
    },
    {
      id: '_indexParamElement',
      align: 'left',
      disablePadding: false,
      label: indexTrans('param'),
      notSort: true,
    },
    {
      id: '_desc',
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
        primaryKey="_fieldId"
        showHoverStyle={false}
        page={currentPage}
        onChangePage={handlePageChange}
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
