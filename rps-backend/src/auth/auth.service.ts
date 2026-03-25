import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string; user: Partial<User> }> {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new ConflictException('Username already taken');

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.userRepo.create({ username: dto.username, password: hashed });
    const saved = await this.userRepo.save(user);

    return { access_token: this.sign(saved), user: this.sanitize(saved) };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.sign(user), user: this.sanitize(user) };
  }

  getMe(user: User): Partial<User> {
    return this.sanitize(user);
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private sign(user: User): string {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload);
  }

  /** Strip password from returned user object */
  private sanitize(user: User): Partial<User> {
    const { password: _pw, ...safe } = user;
    return safe;
  }
}
