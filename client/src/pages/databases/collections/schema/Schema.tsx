import { Typography, Tooltip, Box } from '@mui/material';
import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import Icons from '@/components/icons/Icons';
import { formatFieldType, formatNumber, findKeyValue } from '@/utils';
import { dataContext, rootContext, systemContext } from '@/context';
import IndexTypeElement from './IndexTypeElement';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import StatusAction from '@/pages/databases/collections/StatusAction';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import {
  Wrapper,
  InfoWrapper,
  Card,
  InfoRow,
  InfoLabel,
  InfoValue,
  ActionWrapper,
  StyledChip,
  DataTypeChip,
  NameWrapper,
  ParamWrapper,
  GridWrapper,
} from './StyledComponents';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import RenameCollectionDialog from '@/pages/dialogs/RenameCollectionDialog';
import EditMmapDialog from '@/pages/dialogs/EditMmapDialog';
import DropCollectionDialog from '@/pages/dialogs/DropCollectionDialog';
import CopyButton from '@/components/advancedSearch/CopyButton';
import RefreshButton from '@/components/customButton/RefreshButton';
import { CollectionService } from '@/http';
import type { FieldObject } from '@server/types';

const Overview = () => {
  const { fetchCollection, collections, loading, database } =
    useContext(dataContext);
  const { data } = useContext(systemContext);
  const { setDialog } = useContext(rootContext);

  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const navigate = useNavigate();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: indexTrans } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

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

  // fetch collection if not loaded
  if (collection && !collection.schema) {
    fetchCollection(collectionName);
  }

  // get fields
  const fields = collection?.schema?.fields || [];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      align: 'left',
      disablePadding: true,
      formatter(f: FieldObject) {
        return (
          <NameWrapper>
            <Typography
              variant="body1"
              sx={{
                color: f.name === '$meta' ? 'secondary.dark' : 'inherit',
                fontStyle: f.name === '$meta' ? 'italic' : 'inherit',
              }}
            >
              {f.name}
            </Typography>
            {f.name === '$meta' && (
              <StyledChip size="small" label="Dynamic field" />
            )}
            {f.is_primary_key && (
              <StyledChip
                size="small"
                label="PK"
                sx={{
                  backgroundColor: theme => theme.palette.secondary.light,
                  color: theme => theme.palette.secondary.dark,
                  fontWeight: 600,
                  fontSize: '12px',
                  height: '20px',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                  border: theme => `1px solid ${theme.palette.secondary.main}`,
                }}
              />
            )}
            {f.is_partition_key && (
              <StyledChip size="small" label="Partition key" />
            )}
            {findKeyValue(f.type_params, 'enable_match') && (
              <StyledChip size="small" label={collectionTrans('enableMatch')} />
            )}
            {findKeyValue(f.type_params, 'enable_analyzer') === 'true' && (
              <Tooltip
                title={findKeyValue(f.type_params, 'analyzer_params') as string}
                arrow
              >
                <StyledChip
                  size="small"
                  label={collectionTrans('analyzer')}
                  onClick={() => {
                    const textToCopy = findKeyValue(
                      f.type_params,
                      'analyzer_params'
                    );
                    navigator.clipboard.writeText(textToCopy as string);
                  }}
                />
              </Tooltip>
            )}
            {(findKeyValue(f.type_params, 'mmap.enabled') === 'true' ||
              isCollectionMmapEnabled) && (
              <Tooltip title={collectionTrans('mmapTooltip')} arrow>
                <StyledChip
                  size="small"
                  label={collectionTrans('mmapEnabled')}
                  onClick={() => {
                    setDialog({
                      open: true,
                      type: 'custom',
                      params: {
                        component: (
                          <EditMmapDialog
                            collection={collection!}
                            cb={async () => {
                              fetchCollection(collectionName);
                            }}
                          />
                        ),
                      },
                    });
                  }}
                />
              </Tooltip>
            )}
            {f.function && (
              <Tooltip title={JSON.stringify(f.function)} arrow>
                <StyledChip
                  size="small"
                  label={`
                    ${
                      f.is_function_output
                        ? `<- ${f.function.type}(${f.function.input_field_names})`
                        : ` ${collectionTrans('function')}: ${f.function.type}`
                    }`}
                  onClick={() => {
                    const textToCopy = JSON.stringify(f.function);
                    navigator.clipboard.writeText(textToCopy as string);
                  }}
                />
              </Tooltip>
            )}
          </NameWrapper>
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
        return (
          <Typography variant="body1" component="div">
            <DataTypeChip size="small" label={formatFieldType(f)} />
          </Typography>
        );
      },
      label: collectionTrans('fieldType'),
    },
    {
      id: 'nullable',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('nullable'),
      formatter(f) {
        return (
          <Typography variant="body1">
            {f.nullable ? (
              <Icons.check sx={{ fontSize: '11px', ml: 0.5 }} />
            ) : (
              <Icons.cross2 sx={{ fontSize: '11px', ml: 0.5 }} />
            )}
          </Typography>
        );
      },
    },
    {
      id: 'default_value',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('defaultValue'),
      formatter(f) {
        return (
          <Typography variant="body1">{f.default_value || '--'}</Typography>
        );
      },
    },
    {
      id: 'name',
      align: 'left',
      disablePadding: true,
      label: indexTrans('indexName'),
      formatter(f) {
        return <Typography variant="body1">{f.index?.index_name}</Typography>;
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
          <Typography variant="body1" component="div">
            <IndexTypeElement
              field={f}
              collectionName={collectionName}
              cb={async () => {
                await fetchCollection(collectionName);
              }}
            />
          </Typography>
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
        return (
          <Typography variant="body1" component="div">
            {f.index ? (
              <ParamWrapper>
                {f.index.indexParameterPairs.length > 0 ? (
                  f.index.indexParameterPairs.map((p: any) =>
                    p.value ? (
                      <div key={p.key + p.value}>
                        <span className="param">
                          <Typography variant="body1" className="key">
                            {`${p.key}:`}
                          </Typography>
                          <Typography variant="body1" className="value">
                            {p.value}
                          </Typography>
                        </span>
                      </div>
                    ) : (
                      ''
                    )
                  )
                ) : (
                  <>--</>
                )}
              </ParamWrapper>
            ) : (
              <>--</>
            )}
          </Typography>
        );
      },
    },
    {
      id: 'description',
      align: 'left',
      disablePadding: false,
      label: indexTrans('desc'),
      formatter(f) {
        return <Typography variant="body1">{f.description || '--'}</Typography>;
      },
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

  // if is autoID enabled
  const isAutoIDEnabled = collection?.schema?.fields.some(
    f => f.autoID === true
  );

  // check if collection is mmap enabled
  const isCollectionMmapEnabled = collection?.properties?.some((p: any) => {
    return p.key === 'mmap.enabled' && p.value === 'true';
  });

  // get loading state label
  return (
    <Wrapper>
      {collection && (
        <InfoWrapper>
          <Card>
            <InfoRow>
              <InfoLabel>{collectionTrans('name')}</InfoLabel>
              <InfoValue>
                <Tooltip title={collection.collection_name} arrow>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500 }}
                    className="truncate"
                  >
                    {collection.collection_name}
                  </Typography>
                </Tooltip>
                <ActionWrapper>
                  <RefreshButton
                    sx={{
                      '& svg': {
                        width: 16,
                        height: 16,
                      },
                    }}
                    onClick={async () => {
                      setDialog({
                        open: true,
                        type: 'custom',
                        params: {
                          component: (
                            <RenameCollectionDialog
                              collection={collection}
                              cb={async newName => {
                                await fetchCollection(newName);
                                navigate(
                                  `/databases/${database}/${newName}/schema`
                                );
                              }}
                            />
                          ),
                        },
                      });
                    }}
                    tooltip={btnTrans('rename')}
                    icon={<Icons.edit />}
                  />
                  <CopyButton
                    sx={{
                      '& svg': {
                        width: 16,
                        height: 16,
                      },
                    }}
                    copyValue={collection.collection_name}
                  />
                  <RefreshButton
                    sx={{
                      '& svg': {
                        width: 16,
                        height: 16,
                      },
                    }}
                    onClick={async () => {
                      const res =
                        await CollectionService.describeCollectionUnformatted(
                          collection.collection_name
                        );
                      const json = JSON.stringify(res, null, 2);
                      const blob = new Blob([json], {
                        type: 'application/json',
                      });
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
                    sx={{
                      '& svg': {
                        width: 16,
                        height: 16,
                      },
                    }}
                    onClick={() => {
                      setDialog({
                        open: true,
                        type: 'custom',
                        params: {
                          component: (
                            <DropCollectionDialog
                              collections={[collection]}
                              onDelete={() => {
                                navigate(`/databases/${database}`);
                              }}
                            />
                          ),
                        },
                      });
                    }}
                    tooltip={btnTrans('drop')}
                    icon={<Icons.cross />}
                  />
                  <RefreshButton
                    sx={{
                      '& svg': {
                        width: 16,
                        height: 16,
                      },
                    }}
                    tooltip={btnTrans('refresh')}
                    onClick={async () => {
                      await fetchCollection(collectionName);
                    }}
                    icon={<Icons.refresh />}
                  />
                </ActionWrapper>
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{collectionTrans('description')}</InfoLabel>
              <InfoValue>
                <Typography variant="body1">
                  {collection?.description || '--'}
                </Typography>
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{collectionTrans('createdTime')}</InfoLabel>
              <InfoValue>
                <Typography variant="body1">
                  {new Date(collection.createdTime).toLocaleString()}
                </Typography>
              </InfoValue>
            </InfoRow>
          </Card>

          <Card>
            <InfoRow>
              <InfoLabel>{collectionTrans('status')}</InfoLabel>
              <InfoValue>
                <StatusAction
                  status={collection.status}
                  percentage={collection.loadedPercentage}
                  collection={collection}
                  showExtraAction={false}
                  showLoadButton={true}
                  createIndexElement={CreateIndexElement}
                />
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>
                {collectionTrans('replica')}
                <CustomToolTip title={collectionTrans('replicaTooltip')}>
                  <Icons.question
                    sx={{
                      width: 12,
                      height: 12,
                      position: 'relative',
                      top: '2px',
                      right: '-4px',
                    }}
                  />
                </CustomToolTip>
              </InfoLabel>
              <InfoValue>
                <Typography variant="body1">
                  {collection.loaded ? collection.replicas?.length : '...'}
                </Typography>
                {collection.loaded && enableModifyReplica && (
                  <RefreshButton
                    sx={{
                      '& svg': {
                        width: 12,
                        height: 12,
                      },
                    }}
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
                    icon={<Icons.settings />}
                  />
                )}
              </InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>
                {collection.loaded ? (
                  collectionTrans('count')
                ) : (
                  <>
                    {collectionTrans('rowCount')}
                    <CustomToolTip title={collectionTrans('entityCountInfo')}>
                      <Icons.question
                        sx={{
                          width: 12,
                          height: 12,
                          position: 'relative',
                          top: '2px',
                          right: '-4px',
                        }}
                      />
                    </CustomToolTip>
                  </>
                )}
              </InfoLabel>
              <InfoValue>
                <Typography variant="body1">
                  {formatNumber(Number(collection?.rowCount || '0'))}
                </Typography>
              </InfoValue>
            </InfoRow>
          </Card>

          <Card>
            <InfoRow>
              <InfoLabel>{collectionTrans('features')}</InfoLabel>
              <InfoValue>
                <Box className="features-wrapper">
                  {isAutoIDEnabled && (
                    <StyledChip
                      sx={{ border: 'none' }}
                      label={collectionTrans('autoId')}
                      size="small"
                    />
                  )}
                  <Tooltip
                    title={
                      collection.consistency_level
                        ? consistencyTooltipsMap[
                            collection.consistency_level
                          ] || ''
                        : ''
                    }
                    arrow
                  >
                    <StyledChip
                      sx={{ border: 'none' }}
                      label={`${collectionTrans('consistency')}: ${collection.consistency_level}`}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title={collectionTrans('mmapTooltip')} arrow>
                    <StyledChip
                      label={collectionTrans('mmapSettings')}
                      size="small"
                      onDelete={async () => {
                        setDialog({
                          open: true,
                          type: 'custom',
                          params: {
                            component: (
                              <EditMmapDialog
                                collection={collection}
                                cb={async () => {
                                  fetchCollection(collectionName);
                                }}
                              />
                            ),
                          },
                        });
                      }}
                      deleteIcon={
                        <Icons.settings
                          sx={{
                            width: 12,
                            height: 12,
                          }}
                        />
                      }
                    />
                  </Tooltip>
                </Box>
              </InfoValue>
            </InfoRow>
          </Card>
        </InfoWrapper>
      )}

      <GridWrapper>
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
            commonTrans(`grid.${fields.length > 1 ? 'fields' : 'field'}`)
          )}
        />
      </GridWrapper>
    </Wrapper>
  );
};

export default Overview;
