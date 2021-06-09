import { fireEvent } from '@testing-library/react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import CustomInput from '../../customInput/CustomInput';
import {
  IAdornmentConfig,
  IIconConfig,
  ITextfieldConfig,
} from '../../customInput/Types';

let container: any = null;

jest.mock('@material-ui/core/FormControl', () => {
  return props => {
    const { children } = props;
    return <div className="form-control">{children}</div>;
  };
});

jest.mock('@material-ui/core/InputLabel', () => {
  return props => {
    return <div className="label">{props.children}</div>;
  };
});

jest.mock('@material-ui/core/Input', () => {
  return props => {
    const { type, onBlur, endAdornment } = props;
    return (
      <>
        <div className="type">{type}</div>
        <input className="input" type={type} onBlur={onBlur} />
        <div>{endAdornment}</div>
      </>
    );
  };
});

jest.mock('@material-ui/core/TextField', () => {
  return props => {
    const { helperText, onBlur, onChange, label, className } = props;
    return (
      <div className="text-field">
        <div className="text-class">{className}</div>
        <div className="text-label">{label}</div>
        <div className="text-error">{helperText}</div>
        <input
          className="text-input"
          onBlur={onBlur}
          onChange={onChange}
          type="text"
        />
      </div>
    );
  };
});

jest.mock('@material-ui/core/Grid', () => {
  return props => {
    const { children } = props;
    return <div className="grid">{children}</div>;
  };
});

describe('Test CustomInput', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test('test text type input', () => {
    const handleBlur = jest.fn();

    const mockTextConfig: ITextfieldConfig = {
      variant: 'standard',
      label: 'test text',
      key: 'text',
      className: 'classname',
      onBlur: handleBlur,
    };

    act(() => {
      render(
        <CustomInput
          type="text"
          textConfig={mockTextConfig}
          checkValid={() => true}
        />,
        container
      );
    });

    expect(container.querySelectorAll('.text-field').length).toBe(1);
    expect(container.querySelector('.text-class').textContent).toBe(
      'classname'
    );
    expect(container.querySelector('.text-label').textContent).toBe(
      'test text'
    );

    const input = container.querySelector('.text-input');
    input.focus();
    input.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('test icon type input', () => {
    const handleChange = jest.fn();

    const mockIconConfig: IIconConfig = {
      icon: <div className="icon"></div>,
      inputType: 'icon',
      inputConfig: {
        label: 'icon text',
        key: 'icon',
        onChange: handleChange,
        variant: 'standard',
      },
    };

    render(
      <CustomInput
        type="icon"
        iconConfig={mockIconConfig}
        checkValid={() => true}
      />,
      container
    );

    expect(container.querySelectorAll('.grid').length).toBe(3);
    expect(container.querySelectorAll('.icon').length).toBe(1);
    expect(container.querySelector('.text-label').textContent).toBe(
      'icon text'
    );

    const input = container.querySelector('.text-input');
    fireEvent.change(input, { target: { value: 'trigger change' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('test adornmentConfig type input', () => {
    const mockBlurFunc = jest.fn();

    const mockAdornmentConfig: IAdornmentConfig = {
      label: 'adornment',
      icon: <div className="adornment-icon"></div>,
      isPasswordType: false,
      key: 'adornment',
      onInputBlur: mockBlurFunc,
    };

    render(
      <CustomInput
        type="adornment"
        adornmentConfig={mockAdornmentConfig}
        checkValid={() => true}
      />,
      container
    );

    expect(container.querySelector('.label').textContent).toBe('adornment');
    expect(container.querySelector('.type').textContent).toBe('text');
    expect(container.querySelectorAll('.adornment-icon').length).toBe(1);

    const input = container.querySelector('.input');
    input.focus();
    input.blur();
    expect(mockBlurFunc).toHaveBeenCalledTimes(1);
  });

  test('test default type input', () => {
    const mockTextConfig: ITextfieldConfig = {
      label: 'default',
      key: 'default',
      variant: 'standard',
    };

    act(() => {
      render(<CustomInput textConfig={mockTextConfig} />, container);
    });

    expect(container.querySelector('.text-label').textContent).toBe('default');
  });
});
