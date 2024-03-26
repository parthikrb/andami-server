import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt'; // Corrected import
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../users/users.service';

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
    });
    console.log('JwtStrategy initialized');
  }

  async validate(payload: unknown) {
    const user = await this.userService.findOneByAuthId(
      payload['sub'] as string,
    );

    return {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };
  }
}
