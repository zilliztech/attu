import { parseByte } from '../Format';
import { BYTE_UNITS } from '../../consts/Util';
describe('Test Fromat utils', () => {
  it('Test parse byte', () => {
    expect(parseByte('10m')).toEqual(10 * BYTE_UNITS.m);
    expect(parseByte('10mb')).toEqual(10 * BYTE_UNITS.m);
    expect(parseByte('10g')).toEqual(10 * BYTE_UNITS.g);
    expect(parseByte('10gb')).toEqual(10 * BYTE_UNITS.g);
    expect(parseByte('10k')).toEqual(10 * BYTE_UNITS.k);
    expect(parseByte('10kb')).toEqual(10 * BYTE_UNITS.k);
    expect(parseByte('10b')).toEqual(10 * BYTE_UNITS.b);
  });
});
