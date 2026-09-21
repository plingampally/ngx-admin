import { RoundPipe } from './round.pipe';

describe('RoundPipe', () => {
  let pipe: RoundPipe;

  beforeEach(() => {
    pipe = new RoundPipe();
  });

  it('should round down below .5', () => {
    expect(pipe.transform(1.4)).toBe(1);
  });

  it('should round up at .5', () => {
    expect(pipe.transform(1.5)).toBe(2);
  });

  it('should round negative values toward zero at .5', () => {
    expect(pipe.transform(-1.5)).toBe(-1);
  });
});
