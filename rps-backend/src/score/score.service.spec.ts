import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScoreService } from './score.service';
import { HighScore } from './entities/high-score.entity';

const mockRepo = {
  findOne: jest.fn(),
  create:  jest.fn(),
  save:    jest.fn(),
};

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        { provide: getRepositoryToken(HighScore), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
    jest.clearAllMocks();
  });

  describe('getHighScore', () => {
    it('returns 0 when no record exists', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      expect(await service.getHighScore()).toBe(0);
    });

    it('returns the highest score from DB', async () => {
      mockRepo.findOne.mockResolvedValue({ score: 12 });
      expect(await service.getHighScore()).toBe(12);
    });
  });

  describe('tryUpdateHighScore', () => {
    it('saves and returns new score when it beats current', async () => {
      mockRepo.findOne.mockResolvedValue({ score: 5 });
      const record = { score: 10, userId: 'u1' };
      mockRepo.create.mockReturnValue(record);
      mockRepo.save.mockResolvedValue(record);

      const result = await service.tryUpdateHighScore(10, 'u1');

      expect(result).toBe(10);
      expect(mockRepo.save).toHaveBeenCalledWith(record);
    });

    it('returns null when new score does not beat current', async () => {
      mockRepo.findOne.mockResolvedValue({ score: 10 });
      const result = await service.tryUpdateHighScore(7, 'u1');
      expect(result).toBeNull();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('saves with null userId for guest players', async () => {
      mockRepo.findOne.mockResolvedValue({ score: 0 });
      const record = { score: 3, userId: null };
      mockRepo.create.mockReturnValue(record);
      mockRepo.save.mockResolvedValue(record);

      await service.tryUpdateHighScore(3, null);

      expect(mockRepo.create).toHaveBeenCalledWith({ score: 3, userId: null });
    });
  });
});
