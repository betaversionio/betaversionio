import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private from: string;
  private appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.from =
      this.configService.get<string>('SMTP_FROM') ??
      'BetaVersion.IO <noreply@betaversion.io>';
    this.appUrl =
      this.configService.get<string>('NEXT_PUBLIC_APP_URL') ??
      'http://localhost:3000';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com',
      port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER') ?? '',
        pass: this.configService.get<string>('SMTP_PASS') ?? '',
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const verifyUrl = `${this.appUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Verify your email — BetaVersion.IO',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #111; margin-bottom: 16px;">Verify your email</h2>
          <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #555; line-height: 1.6;">
            Thanks for signing up for BetaVersion.IO! Click the button below to verify your email address.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Verify Email
            </a>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">
            This link expires in 24 hours. If you didn't create an account, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #aaa; font-size: 12px;">BetaVersion.IO</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Reset your password — BetaVersion.IO',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #111; margin-bottom: 16px;">Reset your password</h2>
          <p style="color: #555; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Reset Password
            </a>
          </div>
          <p style="color: #888; font-size: 14px; line-height: 1.6;">
            This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #aaa; font-size: 12px;">BetaVersion.IO</p>
        </div>
      `,
    });
  }
}
