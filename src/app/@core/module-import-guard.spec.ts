import { throwIfAlreadyLoaded } from './module-import-guard';

describe('throwIfAlreadyLoaded', () => {
  it('should not throw when parent module is not loaded', () => {
    expect(() => throwIfAlreadyLoaded(null, 'CoreModule')).not.toThrow();
  });

  it('should throw when parent module is already loaded', () => {
    expect(() => throwIfAlreadyLoaded({}, 'CoreModule'))
      .toThrowError(/CoreModule has already been loaded/);
  });
});
