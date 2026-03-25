import { Controller, Get } from '@nestjs/common';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('high')
  async getHighScore(): Promise<{ highScore: number }> {
    const highScore = await this.scoreService.getHighScore();
    return { highScore };
  }
}
