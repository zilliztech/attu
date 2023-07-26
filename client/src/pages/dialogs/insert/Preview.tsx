import { FC, useCallback, useMemo } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { InsertPreviewProps } from './Types';
import { Option } from '@/components/customSelector/Types';
import CustomSelector from '@/components/customSelector/CustomSelector';
import AttuGrid from '@/components/grid/Grid';
import { transferCsvArrayToTableData } from '@/utils/Insert';
import { ColDefinitionsType } from '@/components/grid/Types';
import SimpleMenu from '@/components/menu/SimpleMenu';
import icons from '@/components/icons/Icons';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '75vw',
  },
  selectorTip: {
    color: theme.palette.attuGrey.dark,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  selectorWrapper: {
    '& .selector': {
      flexBasis: '40%',
      minWidth: '256px',
    },

    '& .isContainSelect': {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
  },
  gridWrapper: {
    height: '320px',
  },
  tableTip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),

    '& .text': {
      color: theme.palette.attuGrey.dark,
      fontWeight: 500,
    },
  },
  menuLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: '160px',

    color: theme.palette.attuGrey.dark,
    backgroundColor: '#fff',

    '&:hover': {
      backgroundColor: '#fff',
    },
  },

  menuIcon: {
    color: theme.palette.attuGrey.dark,
  },
  menuItem: {
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuGrey.dark,
  },
  menuActive: {
    color: theme.palette.primary.main,
  },
}));

const getTableData = (
  data: any[],
  isContainFieldNames: number
): { [key in string]: any }[] => {
  const csvData = isContainFieldNames ? data.slice(1) : data;
  return transferCsvArrayToTableData(csvData);
};

const InsertPreview: FC<InsertPreviewProps> = ({
  schemaOptions,
  data,
  isContainFieldNames,
  handleIsContainedChange,
  tableHeads,
  setTableHeads,
  file,
}) => {
  const classes = getStyles();
  const { t: insertTrans } = useTranslation('insert');

  const ArrowIcon = icons.dropdown;
  // table needed table structure, metadata from csv
  const tableData = getTableData(data, isContainFieldNames);

  const handleTableHeadChange = useCallback(
    (index: number, label: string) => {
      const newHeads = [...tableHeads];
      newHeads[index] = label;
      setTableHeads(newHeads);
    },
    [tableHeads, setTableHeads]
  );

  const editHeads = useMemo(
    () =>
      tableHeads.map((head: string, index: number) => ({
        value: head,
        component: (
          <SimpleMenu
            label={head || insertTrans('requiredFieldName')}
            menuItems={schemaOptions.map(schema => ({
              label: schema.label,
              callback: () => handleTableHeadChange(index, schema.label),
              wrapperClass: `${classes.menuItem} ${head === schema.label ? classes.menuActive : ''
                }`,
            }))}
            buttonProps={{
              className: classes.menuLabel,
              endIcon: <ArrowIcon classes={{ root: classes.menuIcon }} />,
            }}
          ></SimpleMenu>
        ),
      })),
    [
      tableHeads,
      classes.menuLabel,
      classes.menuIcon,
      classes.menuItem,
      classes.menuActive,
      ArrowIcon,
      schemaOptions,
      insertTrans,
      handleTableHeadChange,
    ]
  );

  const isContainedOptions: Option[] = [
    {
      label: 'Yes',
      value: 1,
    },
    { label: 'No', value: 0 },
  ];

  // use table row first item to get value
  const colDefinitions: ColDefinitionsType[] = Object.keys(tableData[0])
    // filter id since we don't want to show it in the table
    .filter(item => item !== 'id')
    .map(key => ({
      id: key,
      align: 'left',
      disablePadding: false,
      label: '',
    }));

  return (
    <section className={classes.wrapper}>
      <form className={classes.selectorWrapper}>
        <label>
          <Typography className={classes.selectorTip}>
            {insertTrans('isContainFieldNames')}
          </Typography>
        </label>
        <CustomSelector
          options={isContainedOptions}
          wrapperClass="selector"
          classes={{ filled: 'isContainSelect' }}
          value={isContainFieldNames}
          variant="filled"
          onChange={(e: { target: { value: unknown } }) => {
            const isContainedValue = e.target.value;
            handleIsContainedChange(isContainedValue as number);
          }}
        />
      </form>
      <div className={classes.tableTip}>
        <Typography className="text">
          {insertTrans('previewTipData')}
        </Typography>
        <Typography className="text">
          {insertTrans('previewTipAction')}
        </Typography>
      </div>
      {tableData.length > 0 && (
        <div className={classes.gridWrapper}>
          <AttuGrid
            toolbarConfigs={[]}
            colDefinitions={colDefinitions}
            rows={tableData}
            rowCount={0}
            primaryKey="id"
            openCheckBox={false}
            showHoverStyle={false}
            headEditable={true}
            editHeads={editHeads}
            tableCellMaxWidth="120px"
          />
        </div>
      )}
    </section>
  );
};

export default InsertPreview;
