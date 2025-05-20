import { useEffect, useState, useContext, useMemo } from 'react';
import { Typography, Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authContext, rootContext, dataContext } from '@/context';
import { MilvusService } from '@/http';
import { useFormValidation } from '@/hooks';
import { formatForm, parseJson, getNode } from '@/utils';
import { MILVUS_NODE_TYPE, MILVUS_DEPLOY_MODE } from '@/consts';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import icons from '@/components/icons/Icons';
import type { CollectionObject } from '@server/types';
import { CollectionService } from '@/http';

const LoadCollectionDialog = (props: {
  collection: CollectionObject;
  onLoad?: (collection: CollectionObject) => void;
  isModifyReplica?: boolean;
}) => {
  const { fetchCollection } = useContext(dataContext);
  const { collection, onLoad, isModifyReplica } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const [form, setForm] = useState({
    replica: collection.replicas?.length || 1,
  });
  const { isManaged } = useContext(authContext);

  const [enableRelica, setEnableRelica] = useState(false);
  const [replicaToggle, setReplicaToggle] = useState(
    collection.replicas!.length > 1
  );
  const [maxQueryNode, setMaxQueryNode] = useState(1);
  const [btnDisabled, setBtnDisabled] = useState(false);

  // check if it is cluster
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await MilvusService.getMetrics();
        const parsedJson = parseJson(res);
        // get root cord
        const rootCoords = getNode(
          parsedJson.workingNodes,
          MILVUS_NODE_TYPE.ROOTCOORD
        );
        // get query nodes
        const queryNodes = getNode(
          parsedJson.workingNodes,
          MILVUS_NODE_TYPE.QUERYNODE
        );

        const rootCoord = rootCoords[0];

        // should we show replic toggle
        const enableRelica =
          rootCoord.infos.system_info.deploy_mode ===
          MILVUS_DEPLOY_MODE.DISTRIBUTED;

        // only show replica toggle in distributed mode && query node > 1
        if (enableRelica && queryNodes.length > 1 && !isManaged) {
          setMaxQueryNode(queryNodes.length);
          setEnableRelica(enableRelica);
        }
      } catch (error) {}
    }
    fetchData();
  }, []);

  // input  state change
  const handleInputChange = (value: number) => {
    setForm({ replica: value });
  };
  // confirm action
  const handleConfirm = async () => {
    let params;

    if (enableRelica) {
      params = { replica_number: Number(form.replica) };
    }

    try {
      setBtnDisabled(true);
      // load collection request
      await CollectionService.loadCollection(
        collection.collection_name,
        params
      );
      // refresh collection
      await fetchCollection(collection.collection_name);

      // show success message
      openSnackBar(
        successTrans(isModifyReplica ? 'modifyReplica' : 'load', {
          name: collectionTrans('collection'),
        })
      );

      // callback
      if (onLoad) {
        await onLoad(collection);
      }
      // close dialog
      handleCloseDialog();
    } catch (error) {
    } finally {
      setBtnDisabled(false);
    }
  };

  // validator
  const checkedForm = useMemo(() => {
    return enableRelica ? [] : formatForm(form);
  }, [form, enableRelica]);

  // validate
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  // input config
  const inputConfig: ITextfieldConfig = {
    label: collectionTrans('replicaNum'),
    type: 'number',
    key: 'replica',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: collectionTrans('replicaNum'),
    fullWidth: true,
    validations: [],
    required: enableRelica,
    defaultValue: form.replica,
  };

  // if replica is enabled, add validation
  if (enableRelica) {
    inputConfig.validations?.push(
      {
        rule: 'require',
        errorText: warningTrans('required', {
          name: collectionTrans('replicaNum'),
        }),
      },
      {
        rule: 'range',
        errorText: warningTrans('range', { min: 1, max: maxQueryNode }),
        extraParam: {
          min: 1,
          max: maxQueryNode,
          type: 'number',
        },
      }
    );
  }

  // toggle enbale replica
  const handleChange = () => {
    setReplicaToggle(!replicaToggle);
    if (!replicaToggle === false) {
      setForm({ replica: 1 });
    }
  };

  const QuestionIcon = icons.question;

  return (
    <DialogTemplate
      title={dialogTrans(isModifyReplica ? 'modifyReplicaTitle' : 'loadTitle', {
        type: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography
            variant="body1"
            component="p"
            sx={{ marginBottom: 2, maxWidth: 480 }}
          >
            {collectionTrans(isModifyReplica ? 'replicaDes' : 'loadContent')}
          </Typography>
          {enableRelica ? (
            <>
              <FormControlLabel
                control={
                  <Switch checked={replicaToggle} onChange={handleChange} />
                }
                label={
                  <CustomToolTip title={collectionTrans('replicaDes')}>
                    <>
                      {collectionTrans('enableRepica')}
                      <QuestionIcon sx={{ fontSize: 14, ml: 0.5 }} />
                    </>
                  </CustomToolTip>
                }
                sx={{ marginBottom: 2 }}
              />
            </>
          ) : null}
          {replicaToggle ? (
            <>
              <CustomInput
                type="text"
                textConfig={inputConfig}
                checkValid={checkIsValid}
                validInfo={validation}
              />
            </>
          ) : null}
        </>
      }
      confirmLabel={btnTrans(isModifyReplica ? 'confirm' : 'load')}
      handleConfirm={handleConfirm}
      confirmDisabled={replicaToggle ? disabled || btnDisabled : btnDisabled}
    />
  );
};

export default LoadCollectionDialog;
