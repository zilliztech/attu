import { Typography, Chip, Tooltip } from '@mui/material';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { formatFieldType, formatNumber } from '@/utils';
import { dataContext, rootContext, systemContext } from '@/context';
import IndexTypeElement from './IndexTypeElement';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import StatusAction from '@/pages/databases/collections/StatusAction';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { FieldObject } from '@server/types';
import { useStyles } from './Styles';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import CopyButton from '@/components/advancedSearch/CopyButton';
import RefreshButton from '@/components/customButton/RefreshButton';
import { CollectionService } from '@/http';

const Overview = () => {
  const { fetchCollection, collections, loading } = useContext(dataContext);
  const { data } = useContext(systemContext);
  const { setDialog } = useContext(rootContext);

  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
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
                <Icons.key classes={{ root: 'key' }} />
              </div>
            ) : null}
            {f.is_partition_key ? (
              <Chip
                className={classes.chip}
                size="small"
                label="Partition key"
              />
            ) : null}
            {f.autoID ? (
              <Chip className={classes.chip} size="small" label="auto id" />
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

  // only show create index element when there is only one vector field
  let CreateIndexElement = null;
  if (
    collection &&
    collection.schema &&
    collection.schema.vectorFields.length === 1
  ) {
    CreateIndexElement = (
      <IndexTypeElement
        field={
          (collection.schema && collection.schema.vectorFields[0]) ||
          ({} as FieldObject)
        }
        collectionName={collectionName}
        cb={async () => {
          await fetchCollection(collectionName);
        }}
      />
    );
  }

  // enable modify replica if there are more than one query node
  const enableModifyReplica =
    data && data.queryNodes && data.queryNodes.length > 1;

  // get loading state label
  return (
    <section className={classes.wrapper}>
      {collection && (
        <section className={classes.infoWrapper}>
          <div className={classes.cardWrapper}>
            <div className={classes.card}>
              <Typography variant="h5">{collectionTrans('name')}</Typography>
              <Typography variant="h6">
                <p title={collection.collection_name}>
                  {collection.collection_name}
                </p>
                <CopyButton
                  className={classes.extraBtn}
                  label={collection.collection_name}
                  value={collection.collection_name}
                />
                <RefreshButton
                  className={classes.extraBtn}
                  onClick={async () => {
                    const res =
                      await CollectionService.describeCollectionUnformatted(
                        collection.collection_name
                      );

                    // download json file
                    const json = JSON.stringify(res, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${collection.collection_name}.json`;
                    a.click();
                  }}
                  tooltip={btnTrans('downloadSchema')}
                  icon={<Icons.download />}
                />
                <RefreshButton
                  className={classes.extraBtn}
                  tooltip={btnTrans('refresh')}
                  onClick={async () => {
                    await fetchCollection(collectionName);
                  }}
                />
              </Typography>
              <Typography variant="h5">
                {collectionTrans('description')}
              </Typography>
              <Typography variant="h6">
                {collection?.description || '--'}
              </Typography>
              <Typography variant="h5">
                {collectionTrans('createdTime')}
              </Typography>
              <Typography variant="h6">
                {new Date(collection.createdTime).toLocaleString()}
              </Typography>
            </div>

            <div className={classes.card}>
              <Typography variant="h5">{collectionTrans('status')}</Typography>
              <StatusAction
                status={collection.status}
                percentage={collection.loadedPercentage}
                collection={collection}
                showExtraAction={true}
                createIndexElement={CreateIndexElement}
              />
              <Typography variant="h5">
                {collectionTrans('replica')}
                <CustomToolTip title={collectionTrans('replicaTooltip')}>
                  <Icons.question classes={{ root: classes.questionIcon }} />
                </CustomToolTip>
              </Typography>
              <Typography variant="h6">
                {collection.loaded ? collection.replicas?.length : '...'}
                {collection.loaded && enableModifyReplica && (
                  <CustomIconButton
                    className={classes.extraBtn}
                    tooltip={collectionTrans('modifyReplicaTooltip')}
                    onClick={() => {
                      setDialog({
                        open: true,
                        type: 'custom',
                        params: {
                          component: (
                            <LoadCollectionDialog
                              collection={collection}
                              isModifyReplica={true}
                            />
                          ),
                        },
                      });
                    }}
                  >
                    <Icons.settings />
                  </CustomIconButton>
                )}
              </Typography>

              <Typography variant="h5">
                {collection.loaded ? (
                  collectionTrans('count')
                ) : (
                  <>
                    {collectionTrans('rowCount')}
                    <CustomToolTip title={collectionTrans('entityCountInfo')}>
                      <Icons.question
                        classes={{ root: classes.questionIcon }}
                      />
                    </CustomToolTip>
                  </>
                )}
              </Typography>
              <Typography variant="h6">
                {formatNumber(Number(collection?.rowCount || '0'))}
              </Typography>
            </div>
            <div className={classes.card}>
              <Typography variant="h5">
                {collectionTrans('features')}
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
                    label={`${collectionTrans('consistency')}: ${
                      collection.consistency_level
                    }`}
                    size="small"
                  />
                </Tooltip>

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
                    />
                  </Tooltip>
                ) : null}
              </Typography>
            </div>
          </div>
        </section>
      )}

      <section className={classes.gridWrapper}>
        {/* <Typography variant="h5">{collectionTrans('schema')}</Typography> */}

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

export default Overview;
