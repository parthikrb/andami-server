import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt'; // Corrected import
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UsersService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.CLERK_FRONTEND_API}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `${process.env.CLERK_FRONTEND_API}`,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
    console.log('JwtStrategy initialized');
  }

  async validate(request: Request, payload: any) {
    if (request.path === '/api/users' && request.method === 'POST') {
      // Bypass user existence check
      return true;
    }

    if (
      request.path === '/api/users' &&
      request.method === 'GET' &&
      request.query?.authId
    ) {
      return true;
    }
    try {
      const user = await this.userService.findOneByAuthId(
        payload['sub'] as string,
      );
      if (!user) {
        throw new UnauthorizedException('No user found with this ID');
      }
      return {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new UnauthorizedException(
          'Authentication failed: User not found',
        );
      } else {
        throw new InternalServerErrorException(
          'An error occurred during authentication',
        );
      }
    }
  }
}
