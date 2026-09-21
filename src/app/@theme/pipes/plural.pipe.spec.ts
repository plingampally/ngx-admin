import { PluralPipe } from './plural.pipe';

describe('PluralPipe', () => {
  let pipe: PluralPipe;

  beforeEach(() => {
    pipe = new PluralPipe();
  });

  it('should use singular label for 1', () => {
    expect(pipe.transform(1, 'item')).toBe('1 item');
  });

  it('should pluralize label for values other than 1', () => {
    expect(pipe.transform(3, 'item')).toBe('3 items');
  });

  it('should use custom plural label when provided', () => {
    expect(pipe.transform(2, 'person', 'people')).toBe('2 people');
  });

  it('should pluralize for 0', () => {
    expect(pipe.transform(0, 'item')).toBe('0 items');
  });

  it('should treat undefined as 0', () => {
    expect(pipe.transform(undefined, 'item')).toBe('0 items');
  });
});
