import { signReport, verifyReport } from '@/lib/crypto';

describe('Crypto Library', () => {
  const mockParams = {
    date: '2026-04-13',
    volume: 50.5,
    type: 'daily'
  };

  it('should generate a consistent signature for the same parameters', () => {
    const sig1 = signReport(mockParams);
    const sig2 = signReport(mockParams);
    expect(sig1).toBe(sig2);
    expect(sig1.length).toBe(64); // SHA-256 hex length
  });

  it('should verify a valid signature correctly', () => {
    const signature = signReport(mockParams);
    const isValid = verifyReport(mockParams, signature);
    expect(isValid).toBe(true);
  });

  it('should fail verification if parameters are altered', () => {
    const signature = signReport(mockParams);
    const alteredParams = { ...mockParams, volume: 51.5 };
    const isValid = verifyReport(alteredParams, signature);
    expect(isValid).toBe(false);
  });

  it('should fail verification for an incorrect signature', () => {
    const isValid = verifyReport(mockParams, 'wrong_signature');
    expect(isValid).toBe(false);
  });

  it('should generate different signatures for different orders of parameters (stability check)', () => {
    // Note: Our implementation sorts keys, so order should NOT matter
    const paramsOrdered = { a: 1, b: 2 };
    const paramsReversed = { b: 2, a: 1 };
    
    expect(signReport(paramsOrdered)).toBe(signReport(paramsReversed));
  });
});
