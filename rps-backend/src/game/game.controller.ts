import {
  Controller, Post, Get, Body,
  UseGuards, Request, Res,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { GameService } from './game.service';
import { PlayDto } from './dto/play.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { User } from '../auth/user.entity';

interface ReqWithUser extends ExpressRequest {
  user?: User;
}

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /** Play a round — works for both authenticated users and guests */
  @UseGuards(OptionalJwtGuard)
  @Post('play')
  async play(
    @Body() dto: PlayDto,
    @Request() req: ReqWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.gameService.play(dto.action, req.user, req, res);
  }

  /** Reset your score to 0 */
  @UseGuards(OptionalJwtGuard)
  @Post('reset')
  async reset(
    @Request() req: ReqWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.gameService.resetScore(req.user, res);
    return { message: 'Score reset' };
  }

  /** Get current state (yourScore + highScore) */
  @UseGuards(OptionalJwtGuard)
  @Get('state')
  async getState(@Request() req: ReqWithUser) {
    return this.gameService.getState(req.user, req);
  }
}
