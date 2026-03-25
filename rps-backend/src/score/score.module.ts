import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HighScore } from './entities/high-score.entity';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HighScore])],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
