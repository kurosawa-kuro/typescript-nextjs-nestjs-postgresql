import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DatabaseService  } from './database.service';
import { Pool, QueryResult } from 'pg';

type MockQueryResult<T> = {
  rows: T[];
};

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
        rowCount: 0,
        oid: 0,
        fields: []
      };
      mockPool.query.mockResolvedValueOnce(mockResult);

      const result = await service.executeQuery('SELECT * FROM test');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(result).toEqual(mockResult);
    });

    it('should log and rethrow an error when query fails', async () => {
      const error = new Error('Database failure');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.executeQuery('SELECT * FROM test')).rejects.toThrow(error);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test', []);
      // This assumes that the Logger.error is mocked and checked elsewhere for being called.
    });
  });

  describe('onModuleDestroy', () => {
    it('should end the pool connection', async () => {
      await service.onModuleDestroy();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  // Your other specific method tests would be updated in a similar pattern,
  // utilizing `executeQuery` in your service methods and ensuring that each
  // test case reflects the right SQL and parameters passed to `executeQuery`.
});
