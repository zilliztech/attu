import type { FieldObject } from '@server/types';

export interface ConditionProps {
  others?: object;
  onDelete: () => void;
  triggerChange: (id: string, data: TriggerChangeData) => void;
  fields: FieldObject[];
  id: string;
  initData: any;
  className?: string;
}

export interface TriggerChangeData {
  field: FieldObject;
  op: string;
  value: string;
  originValue: string;
  isCorrect: boolean;
  id: string;
  jsonKey: string;
}

export interface ConditionGroupProps {
  others?: object;
  fields: FieldObject[];
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
  size?: 'medium' | 'small' | undefined;
}

export interface DialogProps {
  others?: object;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onReset: () => void;
  onCancel: () => void;
  title: string;
  fields: FieldObject[];
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
  fields: FieldObject[];
}

export interface ConditionData {
  field: FieldObject;
  op: string;
  value: string;
  isCorrect: boolean;
}
