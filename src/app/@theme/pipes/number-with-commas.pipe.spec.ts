import { NumberWithCommasPipe } from './number-with-commas.pipe';

describe('NumberWithCommasPipe', () => {
  let pipe: NumberWithCommasPipe;

  beforeEach(() => {
    pipe = new NumberWithCommasPipe();
  });

  it('should format numbers like Intl.NumberFormat', () => {
    expect(pipe.transform(1234567)).toBe(new Intl.NumberFormat().format(1234567));
  });

  it('should format 0', () => {
    expect(pipe.transform(0)).toBe('0');
  });
});
