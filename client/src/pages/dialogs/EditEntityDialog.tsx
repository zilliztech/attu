import { FC, useContext, useEffect, useRef, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { CollectionFullObject } from '@server/types';
import { DataService } from '@/http';
import { DYNAMIC_FIELD } from '@/consts';

const useStyles = makeStyles((theme: Theme) => ({
  code: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    overflow: 'auto',
  },
  tip: {
    fontSize: 12,
    marginBottom: 8,
  },
}));

type EditEntityDialogProps = {
  data: { [key: string]: any };
  collection: CollectionFullObject;
  cb?: () => void;
};

// json linter for cm
const linterExtension = linter(jsonParseLinter());

const EditEntityDialog: FC<EditEntityDialogProps> = props => {
  // props
  const { data, collection } = props;
  // UI states
  const [disabled, setDisabled] = useState(true);
  // context
  const { handleCloseDialog } = useContext(rootContext);
  // translations
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  // styles
  const classes = useStyles();

  // sort data by collection schema order
  const schema = collection.schema;
  let sortedData: { [key: string]: any } = {};
  schema.fields.forEach(field => {
    if (data[field.name] !== undefined) {
      sortedData[field.name] = data[field.name];
    }
  });

  // add dynamic fields if exist
  const isDynamicSchema = collection.schema.dynamicFields.length > 0;
  if (isDynamicSchema) {
    sortedData = { ...sortedData, ...data[DYNAMIC_FIELD] };
  }

  const originalData = JSON.stringify(sortedData, null, 4);

  // create editor
  useEffect(() => {
    if (!editor.current) {
      const startState = EditorState.create({
        doc: originalData,
        extensions: [
          basicSetup,
          json(),
          linterExtension,
          keymap.of([{ key: 'Tab', run: insertTab }]), // fix tab behaviour
          indentUnit.of('    '), // fix tab indentation
          EditorView.theme({
            '&.cm-editor': {
              '&.cm-focused': {
                outline: 'none',
              },
            },
            '.cm-content': {
              color: '#484D52',
              fontSize: '12px',
            },
            '.cm-tooltip-lint': {
              width: '80%',
            },
          }),
          EditorView.lineWrapping,
          EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
            if (viewUpdate.docChanged) {
              const d = jsonParseLinter()(view);
              if (d.length !== 0) {
                setDisabled(true);
                return;
              }

              const doc = viewUpdate.state.doc;
              const value = doc.toString();

              setDisabled(value === originalData);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorEl.current!,
      });

      editor.current = view;

      return () => {
        view.destroy();
        editor.current = undefined;
      };
    }
  }, [JSON.stringify(data)]);

  // handle confirm
  const handleConfirm = async () => {
    await DataService.upsert(collection.collection_name, {
      fields_data: [JSON.parse(editor.current?.state.doc.toString()!)],
    });

    props.cb && props.cb();
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={dialogTrans('editEntityTitle')}
      handleClose={handleCloseDialog}
      children={
        <>
          <div className={classes.tip}>{dialogTrans('editEntityInfo')}</div>
          <div
            className={`${classes.code} cm-editor`}
            ref={editorEl}
            onClick={() => {
              if (editor.current) editor.current.focus();
            }}
          ></div>
        </>
      }
      confirmDisabled={disabled}
      confirmLabel={btnTrans('edit')}
      handleConfirm={handleConfirm}
      showCancel={true}
    />
  );
};

export default EditEntityDialog;
