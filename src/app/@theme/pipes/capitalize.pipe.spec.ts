import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  let pipe: CapitalizePipe;

  beforeEach(() => {
    pipe = new CapitalizePipe();
  });

  it('should capitalize the first letter and lowercase the rest', () => {
    expect(pipe.transform('hELLO')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should pass through null and undefined', () => {
    expect(pipe.transform(null)).toBe(null);
    expect(pipe.transform(undefined)).toBe(undefined);
  });
});
