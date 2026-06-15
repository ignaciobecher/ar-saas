import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

export interface GithubProfile {
  githubId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    const opts = {
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    };
    super(opts);
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user: GithubProfile | false) => void,
  ): void {
    const email =
      profile.emails?.[0]?.value ?? null;

    if (!email) {
      done(new Error('No public email on GitHub account'), false);
      return;
    }

    done(null, {
      githubId: profile.id,
      name: profile.displayName || profile.username || email.split('@')[0],
      email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
