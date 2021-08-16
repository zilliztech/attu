import { renderHook, act } from '@testing-library/react-hooks';
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

test('test useFormValidation hook', () => {
  const { result } = renderHook(() => useFormValidation(mockForm));
  const { checkFormValid, checkIsValid, validation } = result.current;

  expect(checkFormValid(mockForm)).toBeFalsy();
  expect(Object.keys(validation)).toEqual(['username']);

  act(() => {
    const { result } = checkIsValid({
      value: '',
      key: 'username',
      rules: [{ rule: 'require', errorText: 'name is required' }],
    });

    expect(result).toBeTruthy();
  });

  act(() => {
    const { result } = checkIsValid({
      value: '11111',
      key: 'email',
      rules: [{ rule: 'email', errorText: 'email is invalid' }],
    });
    expect(result).toBeTruthy();
  });

  act(() => {
    const { result } = checkIsValid({
      value: '12345678aQ',
      key: 'password',
      rules: [{ rule: 'password', errorText: 'password is invalid' }],
    });
    expect(result).toBeTruthy();
  });
});
