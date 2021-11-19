import { DataTypeStringEnum } from '../../pages/collections/Types';

export interface ConditionProps {
  others?: object;
  onDelete: () => void;
  triggerChange: (id: string, data: TriggerChangeData) => void;
  fields: Field[];
  id: string;
  initData: any;
  className?: string;
}

export interface Field {
  name: string;
  type: DataTypeStringEnum;
}

export interface TriggerChangeData {
  field: Field;
  op: string;
  value: string;
  isCorrect: boolean;
  id: string;
}

export interface ConditionGroupProps {
  others?: object;
  fields: Field[];
  handleConditions: any;
  conditions: any[];
}

export interface BinaryLogicalOpProps {
  onChange: (newOp: string) => void;
  className?: string;
  initValue?: string;
}

export interface AddConditionProps {
  className?: string;
  onClick?: () => void;
}

export interface CopyButtonProps {
  className?: string;
  icon?: any;
  // needed for accessibility, will not show on page
  label: string;
  value: string;
  others?: any;
}

export interface DialogProps {
  others?: object;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onReset: () => void;
  onCancel: () => void;
  title: string;
  fields: Field[];
  handleConditions: any;
  conditions: any[];
  isLegal: boolean;
  expression: string;
}

export interface FilterProps {
  className?: string;
  title: string;
  showTitle?: boolean;
  showTooltip?: boolean;
  filterDisabled?: boolean;
  others?: { [key: string]: any };
  onSubmit: (data: any) => void;
  tooltipPlacement?: 'left' | 'right' | 'bottom' | 'top';
  fields: Field[];
}

export interface ConditionData {
  field: Field;
  op: string;
  value: string;
  isCorrect: boolean;
}
