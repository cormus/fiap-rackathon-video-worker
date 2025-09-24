import { Status } from "../../../src/domain/enumeration/Status";

describe('Status', () => {
  it('should have PENDENTE status', () => {
    expect(Status.PENDING).toBeDefined();
    expect(Status.PENDING).toBe('PENDENTE');
  });

  it('should have CONCLUIDO status', () => {
    expect(Status.PROCESSING).toBeDefined();
    expect(Status.PROCESSING).toBe('CONCLUIDO');
  });

  it('should have FALHA status', () => {
    expect(Status.ERROR).toBeDefined();
    expect(Status.ERROR).toBe('FALHA');
  });

  it('should have all expected status values', () => {
    const expectedStatuses = ['PENDENTE', 'CONCLUIDO', 'FALHA'];
    const actualStatuses = Object.values(Status);
    
    expect(actualStatuses).toHaveLength(expectedStatuses.length);
    expectedStatuses.forEach(status => {
      expect(actualStatuses).toContain(status);
    });
  });

  it('should have unique status values', () => {
    const statusValues = Object.values(Status);
    const uniqueValues = [...new Set(statusValues)];
    expect(statusValues).toHaveLength(uniqueValues.length);
  });

  it('should be string values', () => {
    Object.values(Status).forEach(status => {
      expect(typeof status).toBe('string');
    });
  });

  describe('Status transitions', () => {
    it('should have proper status flow sequence', () => {
      // Verify that all statuses are accessible
      expect(Status.PENDING).toBeTruthy();
      expect(Status.PROCESSING).toBeTruthy();
      expect(Status.ERROR).toBeTruthy();
    });

    it('should allow checking status equality', () => {
      const currentStatus = Status.PENDING;
      expect(currentStatus === Status.PENDING).toBe(true);
    });
  });
});