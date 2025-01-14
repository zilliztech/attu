import { useState } from 'react';
import { checkEmptyValid, getCheckResult } from '../utils/Validation';
import type { IValidation } from '../components/customInput/Types';

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

// form and element ref
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
  const isOverallValid = Object.values(validation).every(
    v => !(v as IValidationItem).result
  );
  const [disabled, setDisabled] = useState<boolean>(!isOverallValid);

  const checkIsValid = (param: ICheckValidParam): IValidationItem => {
    const { value, key, rules } = param;

    let validDetail = {
      result: false,
      errText: '',
    };

    const hasRequire = rules.some(r => r.rule === 'require');

    // if value is empty, and no require rule, skip this check
    if (!checkEmptyValid(value) && !hasRequire) {
      setDisabled(false);
      return validDetail;
    }

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

  const checkFormValid = (elementClass: string) => {
    // find dom element to check
    const elements = document.querySelectorAll(
      elementClass
    ) as NodeListOf<HTMLElement>;
    // Trigger blur
    elements.forEach(element => {
      // Using setTimeout to trigger blur event after render
      setTimeout(() => {
        // Using HTMLElement.prototype.blur method to trigger blur event
        element.focus();
        element.blur();
      }, 0);
    });
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
