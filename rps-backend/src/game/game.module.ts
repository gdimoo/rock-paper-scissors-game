import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ScoreGateway } from './game.gateway';
import { ScoreModule } from '../score/score.module';
import { User } from '../auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ScoreModule,
    ConfigModule,
  ],
  controllers: [GameController],
  providers: [GameService, ScoreGateway],
})
export class GameModule {}
