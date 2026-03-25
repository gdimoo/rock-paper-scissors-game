import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { ScoreService } from '../score/score.service';
import { ScoreGateway } from './game.gateway';
import { User } from '../auth/user.entity';
import { Request, Response } from 'express';

const mockUserRepo = {
  save: jest.fn(),
};

const mockScoreService = {
  getHighScore: jest.fn().mockResolvedValue(5),
  tryUpdateHighScore: jest.fn().mockResolvedValue(null),
};

const mockScoreGateway = {
  broadcastHighScore: jest.fn(),
};

const mockReq = (cookies = {}) => ({ cookies }) as unknown as Request;
const mockRes = () => ({ cookie: jest.fn() }) as unknown as Response;

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: ScoreService,            useValue: mockScoreService },
        { provide: ScoreGateway,            useValue: mockScoreGateway },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    jest.clearAllMocks();
    mockScoreService.getHighScore.mockResolvedValue(5);
    mockScoreService.tryUpdateHighScore.mockResolvedValue(null);
  });

  describe('play — authenticated user', () => {
    it('increments user.yourScore on WIN', async () => {
      // force WIN: player ROCK, we stub randomAction via Math.random
      jest.spyOn(Math, 'random').mockReturnValue(2 / 3); // index 2 → SCISSORS
      const user = { id: 'u1', yourScore: 2 } as User;

      const result = await service.play('ROCK', user, mockReq(), mockRes());

      expect(result.result).toBe('WIN');
      expect(result.yourScore).toBe(3);
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ yourScore: 3 }));
    });

    it('resets score to 0 on LOSE', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(1 / 3); // index 1 → PAPER beats ROCK
      const user = { id: 'u1', yourScore: 2 } as User;

      const result = await service.play('ROCK', user, mockReq(), mockRes());

      expect(result.result).toBe('LOSE');
      expect(result.yourScore).toBe(0);
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ yourScore: 0 }));
    });

    it('does not change score on DRAW', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // index 0 → ROCK
      const user = { id: 'u1', yourScore: 1 } as User;

      const result = await service.play('ROCK', user, mockReq(), mockRes());

      expect(result.result).toBe('DRAW');
      expect(result.yourScore).toBe(1);
    });
  });

  describe('play — guest (cookie)', () => {
    it('increments cookie score on WIN', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(2 / 3); // SCISSORS → ROCK wins
      const res = mockRes();

      const result = await service.play('ROCK', undefined, mockReq({ rps_your_score: '3' }), res);

      expect(result.result).toBe('WIN');
      expect(result.yourScore).toBe(4);
      expect((res.cookie as jest.Mock)).toHaveBeenCalledWith('rps_your_score', '4', expect.any(Object));
    });

    it('defaults to 0 when cookie missing', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(2 / 3);
      const result = await service.play('ROCK', undefined, mockReq({}), mockRes());
      expect(result.yourScore).toBe(1);
    });
  });

  describe('high score broadcast', () => {
    it('broadcasts when new high score is achieved', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(2 / 3);
      mockScoreService.tryUpdateHighScore.mockResolvedValue(10);
      const user = { id: 'u1', yourScore: 9 } as User;

      await service.play('ROCK', user, mockReq(), mockRes());

      expect(mockScoreGateway.broadcastHighScore).toHaveBeenCalledWith(10);
    });

    it('does not broadcast when high score not beaten', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(2 / 3);
      mockScoreService.tryUpdateHighScore.mockResolvedValue(null);
      const user = { id: 'u1', yourScore: 1 } as User;

      await service.play('ROCK', user, mockReq(), mockRes());

      expect(mockScoreGateway.broadcastHighScore).not.toHaveBeenCalled();
    });
  });

  describe('resetScore', () => {
    it('sets user.yourScore to 0 for authenticated user', async () => {
      const user = { id: 'u1', yourScore: 5 } as User;
      await service.resetScore(user, mockRes());
      expect(user.yourScore).toBe(0);
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ yourScore: 0 }));
    });

    it('sets cookie to 0 for guest', async () => {
      const res = mockRes();
      await service.resetScore(undefined, res);
      expect((res.cookie as jest.Mock)).toHaveBeenCalledWith('rps_your_score', '0', expect.any(Object));
    });
  });
});
