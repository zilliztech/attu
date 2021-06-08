import {
  checkIsEmpty,
  checkEmail,
  checkPasswordStrength,
  checkRange,
  checkClusterName,
  checkIpOrCIDR,
  getCheckResult,
} from '../Validation';

describe('Test validation utils', () => {
  test('test checkIsEmpty function', () => {
    expect(checkIsEmpty('')).toBeFalsy();
    expect(checkIsEmpty('test')).toBeTruthy();
  });

  test('test checkEmail function', () => {
    expect(checkEmail('test email')).toBeFalsy();
    expect(checkEmail('test@qq.com')).toBeTruthy();
  });

  test('test checkPasswordStrength function', () => {
    expect(checkPasswordStrength('12345')).toBeFalsy();
    expect(checkPasswordStrength('12345aa++')).toBeFalsy();
    expect(checkPasswordStrength('123asadWDWD++')).toBeTruthy();
  });

  test('test checkRange function', () => {
    expect(checkRange({ value: 'asdffd', min: 2, max: 5 })).toBeFalsy();
    expect(checkRange({ value: 'asdffd', min: 2, max: 6 })).toBeTruthy();
  });

  test('test checkClusterName function', () => {
    expect(checkClusterName('!!!')).toBeFalsy();
    expect(checkClusterName('cluster-name')).toBeTruthy();
  });

  test('test checkIpOrCIDR function', () => {
    expect(checkIpOrCIDR('172.11.111.11')).toBeTruthy();
    expect(checkIpOrCIDR('11111.1.1.1')).toBeFalsy();
  });

  test('test getCheckResult function', () => {
    expect(getCheckResult({ value: '', rule: 'require' })).toBeFalsy();
    expect(
      getCheckResult({
        value: '12345',
        extraParam: { lenMin: 8 },
        rule: 'length',
      })
    ).toBeFalsy();
  });
});
