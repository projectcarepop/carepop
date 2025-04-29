import logger from './logger'; // Use default import

describe('Logger Utility', () => {
  it('should export a logger instance', () => {
    expect(logger).toBeDefined();
  });

  it('should have info and error methods', () => {
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
  });

  // Add more specific tests later
}); 