import { fireEvent, render } from '@testing-library/react';
import CustomInput from '../../customInput/CustomInput';
import provideTheme from '../utils/provideTheme';
import {
  IAdornmentConfig,
  IIconConfig,
  ITextfieldConfig,
} from '../../customInput/Types';
import { vi } from 'vitest';

vi.mock('@material-ui/core/FormControl', () => {
  return (props: any) => {
    const { children } = props;
    return <div className="form-control">{children}</div>;
  };
});

vi.mock('@material-ui/core/InputLabel', () => {
  return (props: any) => {
    return <div className="label">{props.children}</div>;
  };
});

vi.mock('@material-ui/core/Input', () => {
  return (props: any) => {
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

vi.mock('@material-ui/core/TextField', () => {
  return (props: any) => {
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

vi.mock('@material-ui/core/Grid', () => {
  return (props: any) => {
    const { children } = props;
    return <div className="grid">{children}</div>;
  };
});

describe('Test CustomInput', () => {
  test('test text type input', () => {
    const handleBlur = vi.fn();

    const mockTextConfig: ITextfieldConfig = {
      variant: 'standard',
      label: 'test text',
      key: 'text',
      className: 'classname',
      onBlur: handleBlur,
    };

    const res = render(
      <CustomInput
        type="text"
        textConfig={mockTextConfig}
        checkValid={() => true}
      />
    );

    expect(res.getAllByText('test text').length).toBe(1);
    expect(res.getByText('test text').textContent).toBe('test text');
    expect(
      res.getByText('test text').parentElement!.classList.contains('classname')
    ).toBeTruthy();

    const input = res.getByRole('textbox');
    input.focus();
    input.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('test icon type input', () => {
    const handleChange = vi.fn();

    const mockIconConfig: IIconConfig = {
      icon: <div className="icon" role="img"></div>,
      inputType: 'icon',
      inputConfig: {
        label: 'icon text',
        key: 'icon',
        onChange: handleChange,
        variant: 'standard',
      },
    };

    const res = render(
      <CustomInput
        type="icon"
        iconConfig={mockIconConfig}
        checkValid={() => true}
      />
    );

    // expect(res.getAllByText('.grid').length).toBe(3);
    expect(res.getAllByRole('img').length).toBe(1);
    expect(res.getByText('icon text').textContent).toBe('icon text');

    const input = res.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'trigger change' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('test adornmentConfig type input', () => {
    const mockBlurFunc = vi.fn();

    const mockAdornmentConfig: IAdornmentConfig = {
      label: 'adornment',
      icon: <div className="adornment-icon"></div>,
      isPasswordType: false,
      key: 'adornment',
      onInputBlur: mockBlurFunc,
    };

    const res = render(
      provideTheme(
        <CustomInput
          type="adornment"
          adornmentConfig={mockAdornmentConfig}
          checkValid={() => true}
        />
      )
    );

    expect(res.getByText('adornment').textContent).toBe('adornment');
    expect(res.getAllByRole('icon-button').length).toBe(1);

    const input = res.getByRole('textbox');
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

    const res = render(<CustomInput textConfig={mockTextConfig} />);

    expect(res.getByText('default').textContent).toBe('default');
  });
});
