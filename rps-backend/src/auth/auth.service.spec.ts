import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockUserRepo = {
  findOne: jest.fn(),
  create:  jest.fn(),
  save:    jest.fn(),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService,               useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates a new user and returns a token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const saved = { id: 'u1', username: 'great', yourScore: 0 } as User;
      mockUserRepo.create.mockReturnValue(saved);
      mockUserRepo.save.mockResolvedValue(saved);

      const result = await service.register({ username: 'great', password: 'secret123' });

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws ConflictException when username is taken', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ username: 'taken', password: 'pass123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns a token on valid credentials', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      const user = { id: 'u1', username: 'great', password: hash, yourScore: 3 } as User;
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.login({ username: 'great', password: 'correctpass' });

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nobody', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('realpass', 10);
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', password: hash } as User);

      await expect(
        service.login({ username: 'great', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns user without password', () => {
      const user = { id: 'u1', username: 'great', password: 'hash', yourScore: 5 } as User;
      const result = service.getMe(user);
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('great');
    });
  });
});
