import { render } from '@testing-library/react';

import { usePageStyles } from '../CommonStyle';

const setupUsePageStyles = () => {
  const returnVal = {};

  const TestComponent = () => {
    Object.assign(returnVal, usePageStyles());
    return null;
  };

  render(<TestComponent />);
  return returnVal;
};

test('test usePageStyles', () => {
  const style = setupUsePageStyles();
  const expectedStyle = {
    root: 'makeStyles-root-1',
    titleWrapper: 'makeStyles-titleWrapper-2',
    paper: 'makeStyles-paper-3',

    titleContainer: 'makeStyles-titleContainer-4',
    h2: 'makeStyles-h2-5',
    tab: 'makeStyles-tab-6',
  };
  expect(style).toEqual(expectedStyle);
});
