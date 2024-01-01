import { registerAs } from '@nestjs/config';

export const JWTConfig = registerAs('jwt', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
}));
