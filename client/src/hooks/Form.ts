import { useState } from 'react';
import { IValidation } from '../components/customInput/Types';
import { checkEmptyValid, getCheckResult } from '../utils/Validation';

export interface IForm {
  key: string;
  value?: any;
  needCheck?: boolean;
}

interface IValidationInfo {
  // check general validation
  checkFormValid: Function;
  // check detail validation
  checkIsValid: Function;
  validation: {
    [key: string]: IValidationItem;
  };
  disabled: boolean;
  setDisabled: Function;
  resetValidation: (form: IForm[]) => void;
}

export interface IValidationItem {
  result: boolean;
  errText: string;
}

export interface ICheckValidParam {
  value: string;
  key: string;
  // one input can contains multiple rules
  rules: IValidation[];
}

export const useFormValidation = (form: IForm[]): IValidationInfo => {
  const initValidation = form
    .filter(f => f.needCheck)
    .reduce(
      (acc, cur) => ({
        ...acc,
        [cur.key]: {
          result:
            typeof cur.value === 'string' ? cur.value === '' : cur.value === 0,
          errText: '',
        },
      }),
      {}
    );

  // validation detail about form item
  const [validation, setValidation] = useState(initValidation);
  // overall validation result to control following actions
  const [disabled, setDisabled] = useState<boolean>(true);

  const checkIsValid = (param: ICheckValidParam): IValidationItem => {
    const { value, key, rules } = param;

    let validDetail = {
      result: false,
      errText: '',
    };

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const checkResult = getCheckResult({
        value,
        extraParam: rule.extraParam,
        rule: rule.rule,
      });
      if (!checkResult) {
        validDetail = {
          result: true,
          errText: rule.errorText || '',
        };

        break;
      }
    }

    const validInfo = {
      ...validation,
      [key]: validDetail,
    };

    const isOverallValid = Object.values(validInfo).every(
      v => !(v as IValidationItem).result
    );

    setDisabled(!isOverallValid);
    setValidation(validInfo);

    return validDetail;
  };

  const checkFormValid = (form: IForm[]): boolean => {
    const requireCheckItems = form.filter(f => f.needCheck);
    if (requireCheckItems.some(item => !checkEmptyValid(item.value))) {
      return false;
    }

    const validations = Object.values(validation);
    return validations.every(v => !(v as IValidationItem).result);
  };

  const resetValidation = (form: IForm[]) => {
    const validation = form
      .filter(f => f.needCheck)
      .reduce(
        (acc, cur) => ({
          ...acc,
          [cur.key]: { result: cur.value === '', errText: '' },
        }),
        {}
      );
    setValidation(validation);
  };

  return {
    checkFormValid,
    checkIsValid,
    validation,
    disabled,
    setDisabled,
    resetValidation,
  };
};
