import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";
import { TokenService } from "../utils/token";

export class AuthService {
  private readonly googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async loginWithGoogle(payload: { credential?: string; accessToken?: string }) {
    const googleUser = payload.accessToken
      ? await this.fetchGoogleUserFromAccessToken(payload.accessToken)
      : await this.fetchGoogleUserFromCredential(payload.credential);

    const user = await this.userRepository.upsertGoogleUser({
      name: googleUser.name,
      email: googleUser.email,
      googleId: googleUser.sub,
      picture: googleUser.picture
    });

    const token = this.tokenService.sign({
      sub: user.id,
      role: user.role,
      isPremium: user.isPremium
    });

    return { user, token };
  }

  private async fetchGoogleUserFromCredential(credential?: string) {
    if (!credential) {
      throw new Error("Missing Google credential");
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub || !payload.name || !payload.picture) {
      throw new Error("Invalid Google credential");
    }

    return {
      email: payload.email,
      sub: payload.sub,
      name: payload.name,
      picture: payload.picture
    };
  }

  private async fetchGoogleUserFromAccessToken(accessToken?: string) {
    if (!accessToken) {
      throw new Error("Missing Google access token");
    }

    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Unable to fetch Google user profile");
    }

    const payload = (await response.json()) as {
      email?: string;
      sub?: string;
      name?: string;
      picture?: string;
    };

    if (!payload.email || !payload.sub || !payload.name || !payload.picture) {
      throw new Error("Invalid Google user profile");
    }

    return {
      email: payload.email,
      sub: payload.sub,
      name: payload.name,
      picture: payload.picture
    };
  }
}
