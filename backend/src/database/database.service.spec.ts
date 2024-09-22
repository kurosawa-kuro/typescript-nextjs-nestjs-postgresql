// backend\src\database\database.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { Pool, QueryResult } from 'pg';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: {
    query: jest.Mock;
    end: jest.Mock;
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
      end: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  describe('executeQuery', () => {
    it('should execute a query successfully', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'Test' }],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: []
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await service.executeQuery('SELECT * FROM test');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(result).toEqual(mockResult);
    });

    it('should execute a query with parameters successfully', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'Test' }],
        command: '',
        rowCount: 1,
        oid: 0,
        fields: []
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await service.executeQuery('SELECT * FROM test WHERE id = $1', [1]);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should log and rethrow an error when query fails', async () => {
      const error = new Error('Database failure');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.executeQuery('SELECT * FROM test')).rejects.toThrow(error);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
    });
  });

  describe('onModuleDestroy', () => {
    it('should end the pool connection', async () => {
      await service.onModuleDestroy();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});