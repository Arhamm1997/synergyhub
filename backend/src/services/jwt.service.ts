import jwt, { SignOptions, Secret, SignOptions as JWTSignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../models/user.model';

// Debug logging
console.log('=== JWT SERVICE DEBUG ===');
console.log('Config object:', config);
console.log('Config type:', typeof config);
console.log('Config keys:', config ? Object.keys(config) : 'config is undefined');
console.log('JWT Secret:', config?.jwtSecret);
console.log('Process env JWT_SECRET:', process.env.JWT_SECRET);
console.log('========================');

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

export class JwtService {
  // Don't use static readonly for now, check at runtime
  static generateToken(user: IUser & { _id: any }): string {
    // Runtime checks
    console.log('generateToken called - config:', config);
    console.log('generateToken called - jwtSecret:', config?.jwtSecret);

    if (!config) {
      throw new Error('Config object is undefined - check your config file import');
    }

    if (!config.jwtSecret) {
      throw new Error(`JWT_SECRET is not configured. Config keys: ${Object.keys(config)}`);
    }

    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };

    const options = {
      expiresIn: config.jwtExpiresIn || '7d'
    } as SignOptions;

    return jwt.sign(payload, config.jwtSecret, options);
  }

  static verifyToken(token: string): TokenPayload {
    if (!config || !config.jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// Export the generateToken function directly for convenience
export const generateToken = JwtService.generateToken;