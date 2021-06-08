import { render } from '@testing-library/react';
import { IForm, useFormValidation } from '../Form';

const mockForm: IForm[] = [
  {
    key: 'username',
    value: '',
    needCheck: true,
  },
  {
    key: 'nickname',
    value: '',
    needCheck: false,
  },
];

const setupUseFormValidation = () => {
  const returnVal: any = {};

  const TestComponent = () => {
    Object.assign(returnVal, useFormValidation(mockForm));
    return null;
  };

  render(<TestComponent />);
  return returnVal;
};

test('test useFormValidation hook', () => {
  const { checkFormValid, checkIsValid, validation } = setupUseFormValidation();

  expect(checkFormValid(mockForm)).toBeFalsy();
  expect(validation).toEqual([]);
  expect(
    checkIsValid({
      value: '',
      key: 'username',
      rules: [{ rule: 'require', errorText: 'name is required' }],
    }).result
  ).toBeTruthy();
  expect(
    checkIsValid({
      value: '11111',
      key: 'email',
      rules: [{ rule: 'email', errorText: 'email is invalid' }],
    }).result
  ).toBeTruthy();
  expect(
    checkIsValid({
      value: '12345678aQ',
      key: 'password',
      rules: [{ rule: 'password', errorText: 'password is invalid' }],
    }).result
  ).toBeTruthy();
});
