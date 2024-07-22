import { FC, useContext, useEffect, useRef } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { CollectionFullObject } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  code: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    width: '60vw',
    minHeight: '60vh',
    maxHeight: '60vh',
    overflow: 'auto',
  },
}));

type EditEntityDialogProps = {
  data: { [key: string]: any };
  collection: CollectionFullObject;
};

// json linter for cm
const linterExtension = linter(jsonParseLinter());

const EditEntityDialog: FC<EditEntityDialogProps> = props => {
  // props
  const { data, collection } = props;
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
  const sortedData: { [key: string]: any } = {};
  schema.fields.forEach(field => {
    if (data[field.name] !== undefined) {
      sortedData[field.name] = data[field.name];
    }
  });

  // create editor
  useEffect(() => {
    if (!editor.current) {
      const startState = EditorState.create({
        doc: JSON.stringify(sortedData, null, 4),
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
  const handleConfirm = () => {
    console.log(JSON.parse(editor.current?.state.doc.toString()!));
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={dialogTrans('editEntityTitle')}
      handleClose={handleCloseDialog}
      children={
        <div
          className={`${classes.code} cm-editor`}
          ref={editorEl}
          onClick={() => {
            if (editor.current) editor.current.focus();
          }}
        ></div>
      }
      confirmLabel={btnTrans('edit')}
      handleConfirm={handleConfirm}
      showCancel={true}
    />
  );
};

export default EditEntityDialog;
