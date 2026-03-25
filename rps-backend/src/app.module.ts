import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ScoreModule } from './score/score.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting — applied globally via APP_GUARD below
    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60_000,   // 60-second window
      limit: 60,     // max 60 requests per IP per window
    }]),

    // TypeORM — PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'rps_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    GameModule,
    ScoreModule,
    HealthModule,
  ],
  providers: [
    // Enforce throttling on every endpoint
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
