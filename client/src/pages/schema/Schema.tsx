import {
  makeStyles,
  Theme,
  Typography,
  Chip,
  Tooltip,
} from '@material-ui/core';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { formatFieldType } from '@/utils';
import { rootContext, dataContext } from '@/context';
import IndexTypeElement from './IndexTypeElement';
import { getLabelDisplayedRows } from '../search/Utils';
import { LOADING_STATE } from '@/consts';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';
import StatusAction from '@/pages/collections/StatusAction';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: `100%`,
    overflow: 'auto',
    '& h5': {
      color: theme.palette.attuGrey.dark,
      marginBottom: theme.spacing(0.5),
      fontSize: '14px',
      fontWeight: 400,
    },
  },
  infoWrapper: {
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
  },
  block: {
    '& *': {
      fontSize: '14px',
      lineHeight: 1.5,
    },
    paddingBottom: theme.spacing(2),
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
  primaryKeyChip: {
    fontSize: '8px',
    position: 'relative',
    top: '3px',
    color: 'grey',
  },
  chip: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    fontSize: '12px',
    background: 'rgba(0, 0, 0, 0.04)',
    border: 'none',
  },
  featureChip: {
    marginLeft: 0,
    border: 'none',
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

  gridWrapper: {
    paddingBottom: theme.spacing(2),
  },
}));

const Schema = () => {
  const { setDialog } = useContext(rootContext);
  const { fetchCollection, collections, loading } = useContext(dataContext);
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const consistencyTooltipsMap: Record<string, string> = {
    Strong: collectionTrans('consistencyStrongTooltip'),
    Bounded: collectionTrans('consistencyBoundedTooltip'),
    Session: collectionTrans('consistencySessionTooltip'),
    Eventually: collectionTrans('consistencyEventuallyTooltip'),
  };

  // get collection
  const collection = collections.find(
    c => c.collection_name === collectionName
  );

  // get fields
  const fields = collection?.schema?.fields || [];

  const KeyIcon = icons.key;
  const EnabledIcon = icons.check;

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      align: 'left',
      disablePadding: true,
      formatter(f) {
        return (
          <div className={classes.nameWrapper}>
            {f.name}
            {f.is_primary_key ? (
              <div
                className={classes.primaryKeyChip}
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
      id: 'data_type',
      align: 'left',
      disablePadding: false,
      formatter(f) {
        return formatFieldType(f);
      },
      label: collectionTrans('fieldType'),
    },
    {
      id: 'name',
      align: 'left',
      disablePadding: true,
      label: indexTrans('indexName'),
      formatter(f) {
        return f.index?.index_name;
      },
    },
    {
      id: 'name',
      align: 'left',
      disablePadding: true,
      label: indexTrans('type'),
      notSort: true,
      formatter(f) {
        return (
          <IndexTypeElement
            field={f}
            collectionName={collectionName}
            cb={async () => {
              await fetchCollection(collectionName);
            }}
          />
        );
      },
    },
    {
      id: 'name',
      align: 'left',
      disablePadding: false,
      label: indexTrans('param'),
      notSort: true,
      formatter(f) {
        return f.index ? (
          <div className={classes.paramWrapper}>
            {f.index.indexParameterPairs.length > 0 ? (
              f.index.indexParameterPairs.map((p: any) =>
                p.value ? (
                  <span key={p.key + p.value}>
                    <span className="param">
                      <Typography variant="body1" className="key">
                        {`${p.key}:`}
                      </Typography>
                      <Typography variant="body1" className="value">
                        {p.value}
                      </Typography>
                    </span>
                  </span>
                ) : (
                  ''
                )
              )
            ) : (
              <>--</>
            )}
          </div>
        ) : (
          <>--</>
        );
      },
    },
    {
      id: 'description',
      align: 'left',
      disablePadding: false,
      label: indexTrans('desc'),
    },
  ];

  // get loading state label
  return (
    <section className={classes.wrapper}>
      {collection && (
        <section className={classes.infoWrapper}>
          <div className={classes.block}>
            <Typography variant="h5">{collectionTrans('status')}</Typography>
            <StatusAction
              status={collection.status}
              percentage={collection.loadedPercentage}
              schema={collection.schema!}
              collectionName={collection.collection_name}
              action={() => {
                setDialog({
                  open: true,
                  type: 'custom',
                  params: {
                    component:
                      collection.status === LOADING_STATE.UNLOADED ? (
                        <LoadCollectionDialog collection={collection} />
                      ) : (
                        <ReleaseCollectionDialog collection={collection} />
                      ),
                  },
                });
              }}
            />
          </div>

          <div className={classes.block}>
            <Typography variant="h5">
              {collectionTrans('description')}
            </Typography>
            <Typography variant="h6">
              {collection?.description || '--'}
            </Typography>
          </div>

          <div className={classes.block}>
            <Typography variant="h5">
              {collectionTrans('consistency')}
            </Typography>
            <Typography variant="h6">
              <Tooltip
                title={
                  consistencyTooltipsMap[collection.consistency_level!] || ''
                }
                placement="top"
                arrow
              >
                <Chip
                  className={`${classes.chip} ${classes.featureChip}`}
                  label={collection.consistency_level}
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            </Typography>
          </div>

          <div className={classes.block}>
            <Typography variant="h5">
              {collectionTrans('createdTime')}
            </Typography>
            <Typography variant="h6">
              {new Date(collection.createdTime).toLocaleString()}
            </Typography>
          </div>
        </section>
      )}

      <section className={classes.gridWrapper}>
        <Typography variant="h5">
          {collectionTrans('schema')}
          {collection &&
          collection.schema &&
          collection.schema.enable_dynamic_field ? (
            <Tooltip
              title={collectionTrans('dynamicSchemaTooltip')}
              placement="top"
              arrow
            >
              <Chip
                className={`${classes.chip}`}
                label={collectionTrans('dynamicSchema')}
                size="small"
                icon={<EnabledIcon />}
              />
            </Tooltip>
          ) : null}
        </Typography>

        <AttuGrid
          toolbarConfigs={[]}
          colDefinitions={colDefinitions}
          rows={fields}
          rowCount={fields.length}
          primaryKey="fieldID"
          showHoverStyle={false}
          isLoading={loading}
          openCheckBox={false}
          showPagination={false}
          labelDisplayedRows={getLabelDisplayedRows(
            gridTrans[fields.length > 1 ? 'fields' : 'field']
          )}
        />
      </section>
    </section>
  );
};

export default Schema;
