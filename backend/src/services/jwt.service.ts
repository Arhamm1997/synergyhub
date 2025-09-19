import jwt, { SignOptions, Secret, JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/user.model';

type StringValue = string | undefined;

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export class JwtService {
  private static readonly secret: Secret = config.jwtSecret;
  private static readonly expiresIn: number = typeof config.jwtExpiresIn === 'string' 
    ? parseInt(config.jwtExpiresIn) 
    : 60 * 60 * 24 * 7; // 7 days default

  static generateToken(user: IUser & { _id: any }): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };

    const options: SignOptions = {
      expiresIn: this.expiresIn
    };

    return jwt.sign(payload, this.secret, options);
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}