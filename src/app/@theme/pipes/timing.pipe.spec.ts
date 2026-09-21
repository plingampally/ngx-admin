import { TimingPipe } from './timing.pipe';

describe('TimingPipe', () => {
  let pipe: TimingPipe;

  beforeEach(() => {
    pipe = new TimingPipe();
  });

  it('should format 0 as 00:00', () => {
    expect(pipe.transform(0)).toBe('00:00');
  });

  it('should format minutes and seconds', () => {
    expect(pipe.transform(65)).toBe('01:05');
  });

  it('should format values under an hour', () => {
    expect(pipe.transform(3599)).toBe('59:59');
  });

  it('should format two-digit minutes', () => {
    expect(pipe.transform(600)).toBe('10:00');
  });
});
