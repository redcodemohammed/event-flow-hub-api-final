import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, googleOAuthConfig, JWTConfig } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, googleOAuthConfig, JWTConfig],
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: JWTConfig().accessTokenSecret,
      signOptions: { expiresIn: JWTConfig().accessTokenExpireTime },
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
