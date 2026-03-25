import { IsEnum } from 'class-validator';
import { Action } from '../game.types';

export class PlayDto {
  @IsEnum(['ROCK', 'PAPER', 'SCISSORS'])
  action: Action;
}
