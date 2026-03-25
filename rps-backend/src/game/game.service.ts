import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { User } from '../auth/user.entity';
import { ScoreService } from '../score/score.service';
import { ScoreGateway } from './game.gateway';
import {
  Action, GameResult,
  randomAction, determineResult,
} from './game.types';

const COOKIE_KEY = 'rps_your_score';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface PlayResult {
  botAction: Action;
  result: GameResult;
  yourScore: number;
  highScore: number;
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly scoreService: ScoreService,
    private readonly scoreGateway: ScoreGateway,
  ) {}

  async play(
    playerAction: Action,
    user: User | undefined,
    req: Request,
    res: Response,
  ): Promise<PlayResult> {
    const botAction = randomAction();
    const result = determineResult(playerAction, botAction);

    // --- Resolve and update yourScore ---
    let yourScore: number;

    if (user) {
      // Authenticated: persist score in DB
      if (result === 'WIN')  user.yourScore += 1;
      if (result === 'LOSE') user.yourScore = 0;   // req #3: lose → reset to 0
      await this.userRepo.save(user);
      yourScore = user.yourScore;
    } else {
      // Guest: use cookie
      yourScore = this.getCookieScore(req);
      if (result === 'WIN')  yourScore += 1;
      if (result === 'LOSE') yourScore = 0;         // req #3: lose → reset to 0
      res.cookie(COOKIE_KEY, String(yourScore), {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: false, // FE needs to read it too
        sameSite: 'lax',
      });
    }

    // --- Try to update high score ---
    const userId = user?.id ?? null;
    const newHigh = await this.scoreService.tryUpdateHighScore(yourScore, userId);
    const highScore = newHigh ?? (await this.scoreService.getHighScore());

    // Broadcast to all WS clients if high score was beaten
    if (newHigh !== null) {
      this.scoreGateway.broadcastHighScore(newHigh);
    }

    return { botAction, result, yourScore, highScore };
  }

  async resetScore(
    user: User | undefined,
    res: Response,
  ): Promise<void> {
    if (user) {
      user.yourScore = 0;
      await this.userRepo.save(user);
    } else {
      res.cookie(COOKIE_KEY, '0', {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: false,
        sameSite: 'lax',
      });
    }
  }

  async getState(
    user: User | undefined,
    req: Request,
  ): Promise<{ yourScore: number; highScore: number }> {
    const yourScore = user
      ? user.yourScore
      : this.getCookieScore(req);
    const highScore = await this.scoreService.getHighScore();
    return { yourScore, highScore };
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private getCookieScore(req: Request): number {
    const raw = (req.cookies as Record<string, string>)[COOKIE_KEY];
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
