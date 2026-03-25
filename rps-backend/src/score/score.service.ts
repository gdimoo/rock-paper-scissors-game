import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HighScore } from './entities/high-score.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(HighScore)
    private readonly highScoreRepo: Repository<HighScore>,
  ) {}

  /** Returns the current global high score value (0 if none recorded yet) */
  async getHighScore(): Promise<number> {
    const [record] = await this.highScoreRepo.find({
      order: { score: 'DESC' },
      take: 1,
    });
    return record?.score ?? 0;
  }

  /**
   * If newScore beats the current high score, persist it and return the new value.
   * Returns null if the high score was not beaten.
   */
  async tryUpdateHighScore(
    newScore: number,
    userId: string | null,
  ): Promise<number | null> {
    const current = await this.getHighScore();
    if (newScore <= current) return null;

    const record = this.highScoreRepo.create({ score: newScore, userId });
    await this.highScoreRepo.save(record);
    return newScore;
  }
}
