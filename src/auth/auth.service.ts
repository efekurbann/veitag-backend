import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { uploadQRForUser } from 'src/util/cdn.utils';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, pass: string): Promise<User> {
    const user = await this.userService.create(
      name,
      email,
      bcrypt.hashSync(pass, 10),
    );
    uploadQRForUser(user);
    return user;
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOne(email);
    if (user == null || !user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = bcrypt.compareSync(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Passwords does not match');
    }

    const payload = { sub: user.id, username: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
