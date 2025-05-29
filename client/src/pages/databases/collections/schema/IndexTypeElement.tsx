import { FC, useContext, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';
import { Tooltip } from '@mui/material';
import { IndexCreateParam, IndexExtraParam, IndexManageParam } from './Types';
import { rootContext, dataContext } from '@/context';
import Icons from '@/components/icons/Icons';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { IndexState } from '@/consts/Milvus';
import { NONE_INDEXABLE_DATA_TYPES, DataTypeStringEnum } from '@/consts';
import CreateIndexDialog from './CreateIndexDialog';
import CustomButton from '@/components/customButton/CustomButton';
import { useTheme } from '@mui/material';
import { isVectorType } from '@/utils';
import type { FieldObject } from '@server/types';
import { CollectionService } from '@/http';

const IndexTypeElement: FC<{
  field: FieldObject;
  collectionName: string;
  disabled?: boolean;
  disabledTooltip?: string;
  cb?: (collectionName: string) => void;
}> = ({ field, collectionName, cb, disabled }) => {
  const { fetchCollection } = useContext(dataContext);

  const theme = useTheme();
  // set empty string as default status
  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const requestCreateIndex = async (
    params: IndexExtraParam,
    index_name: string
  ) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: field.name,
      index_name,
      extra_params: params,
    };
    await CollectionService.createIndex(indexCreateParam);
    await fetchCollection(collectionName);
    // reset status to default empty string
    handleCloseDialog();
    openSnackBar(indexTrans('createSuccess'));
    cb && (await cb(collectionName));
  };

  const handleCreate = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <CreateIndexDialog
            collectionName={collectionName}
            field={field}
            handleCancel={handleCloseDialog}
            handleCreate={requestCreateIndex}
          />
        ),
      },
    });
  };

  const requestDeleteIndex = async () => {
    const indexDeleteParam: IndexManageParam = {
      collection_name: collectionName,
      field_name: field.name,
      index_name: field.index.index_name,
    };

    await CollectionService.dropIndex(indexDeleteParam);
    await fetchCollection(collectionName);
    cb && (await cb(collectionName));
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: indexTrans('index') }));
  };

  const handleDelete = () => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <DeleteTemplate
            label={btnTrans('drop')}
            title={dialogTrans('deleteTitle', { type: indexTrans('index') })}
            text={indexTrans('deleteWarning')}
            handleDelete={requestDeleteIndex}
          />
        ),
      },
    });
  };

  const chipComp = (
    text = field.index.indexType,
    icon = (
      <Icons.delete
        sx={{
          width: 16,
          height: 16,
          color: theme => theme.palette.secondary.dark,
        }}
      />
    ),
    tooltip = ''
  ) => {
    let labelText = text;
    if (field.index && field.index.metricType) {
      labelText = `${text}(${field.index.metricType})`;
    }
    const IndexElem = () => (
      <Chip
        label={<span style={{ fontSize: 11 }}>{labelText}</span>}
        sx={{
          backgroundColor: theme => theme.palette.secondary.light,
          color: theme => theme.palette.secondary.dark,
          fontSize: '12px',
          height: '20px',
          '& .MuiChip-label': {
            px: 1,
          },
          border: '1px solid transparent',
          '& .MuiChip-deleteIcon': {
            color: theme => theme.palette.secondary.dark,
            '&:hover': {
              color: theme => theme.palette.secondary.dark,
            },
          },
          '&:hover': {
            border: theme => `1px solid ${theme.palette.secondary.main}`,
            backgroundColor: theme => theme.palette.secondary.light,
          },
        }}
        deleteIcon={icon}
        onDelete={handleDelete}
        disabled={disabled}
        onClick={e => {
          e.stopPropagation();
          handleDelete();
        }}
        size="small"
      />
    );

    return tooltip ? (
      <Tooltip arrow title={tooltip} placement="top">
        <span>
          <IndexElem />
        </span>
      </Tooltip>
    ) : (
      <IndexElem />
    );
  };

  const generateElement = () => {
    if (
      NONE_INDEXABLE_DATA_TYPES.indexOf(
        field.data_type as DataTypeStringEnum
      ) !== -1
    ) {
      return <span style={{ paddingLeft: theme.spacing(1) }}>--</span>;
    }

    if (!field.index) {
      const isVector = isVectorType(field);
      return (
        <CustomButton
          startIcon={<Icons.addOutline />}
          sx={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            backgroundColor: 'transparent',
            borderRadius: 8,
            color: theme => theme.palette.secondary.dark,
            fontWeight: 600,
            fontSize: '12px',
            height: '20px',
            border: theme =>
              isVector
                ? `1px dashed ${theme.palette.secondary.main}`
                : `1px solid ${theme.palette.secondary.main}`,
            '& svg': {
              width: 15,
              color: theme => theme.palette.secondary.dark,
            },
            '&:hover': {
              backgroundColor: theme => theme.palette.secondary.main,
              color: theme => theme.palette.secondary.contrastText,
              '& svg': {
                color: theme => theme.palette.secondary.contrastText,
              },
            },
          }}
          onClick={e => handleCreate(e)}
        >
          {btnTrans(isVector ? 'createVectorIndex' : 'createScalarIndex')}
        </CustomButton>
      );
    }
    // indexType example: FLAT
    switch (field.index.indexType) {
      default: {
        if (field.index.state === IndexState.InProgress) {
          return (
            <>
              {chipComp(
                field.index.indexType,
                <StatusIcon type={LoadingType.CREATING} />,
                indexTrans('cancelCreate')
              )}
            </>
          );
        }

        /**
         * if creating finished, show chip that contains index type
         */
        return chipComp(`${field.index.indexType}`);
      }
    }
  };

  return (
    <span
      style={{
        width: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {generateElement()}
    </span>
  );
};

export default IndexTypeElement;
