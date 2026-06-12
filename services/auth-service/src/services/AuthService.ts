import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import winston from 'winston';
import { UserRepository } from '../repositories/UserRepository.js';
import { IUser } from '../models/User.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'bodygpt_access_secret_12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bodygpt_refresh_secret_12345!';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  private userRepository = new UserRepository();

  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
  }

  private generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(email: string, password: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await this.userRepository.create({
      email,
      passwordHash,
      isVerified: false,
      otp,
      otpExpires
    });

    // Azure Communication Services Mock
    logger.info(`[Azure ACS Mock] Sent OTP ${otp} to ${email}`);

    return {
      userId: user._id,
      email: user.email,
      isVerified: user.isVerified,
      message: 'Registration successful. Please verify OTP.'
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const userIdStr = (user._id as any).toString();
    const accessToken = this.generateAccessToken(userIdStr, user.email);
    const refreshToken = this.generateRefreshToken(userIdStr, user.email);

    await this.userRepository.update(userIdStr, { refreshToken });

    return {
      userId: userIdStr,
      email: user.email,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; email: string };
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || user.refreshToken !== token) {
        throw new Error('Invalid refresh token');
      }

      const userIdStr = (user._id as any).toString();
      const accessToken = this.generateAccessToken(userIdStr, user.email);
      const newRefreshToken = this.generateRefreshToken(userIdStr, user.email);

      await this.userRepository.update(userIdStr, { refreshToken: newRefreshToken });

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const userIdStr = (user._id as any).toString();
    await this.userRepository.update(userIdStr, { otp, otpExpires });

    // Azure Communication Services Mock
    logger.info(`[Azure ACS Mock] Reset Password OTP ${otp} sent to ${email}`);

    return { message: 'OTP sent to registered email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    const userIdStr = (user._id as any).toString();
    await this.userRepository.update(userIdStr, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined
    });

    return { message: 'Email verified successfully' };
  }
}
