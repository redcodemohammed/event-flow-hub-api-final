import { Injectable } from '@nestjs/common';
import { AccountProvider } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async findOrCreateUser(
    provider: AccountProvider,
    accountId: string,
    access_token: string,
    email: string,
    name: string,
  ) {
    // find the user by provider and account id
    let user = await this.prisma.user.findFirst({
      where: {
        accounts: { some: { provider, providerAccountId: accountId } },
      },
    });

    // if no user is found, try to find a user by email
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { email } });

      // if a user is found, add the account to the user
      if (user) {
        await this.prisma.user.update({
          data: {
            accounts: {
              push: { provider, providerAccountId: accountId, access_token },
            },
          },
          where: { id: user.id },
        });
      }
    }

    // if no user is found, create a new user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          accounts: [{ provider, providerAccountId: accountId, access_token }],
          emailVerified: new Date(),
        },
      });
    }

    return user;
  }

  public async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
