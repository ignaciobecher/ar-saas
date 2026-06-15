import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class MailService {
  private readonly resend: Resend | null;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (apiKey && fromEmail) {
      this.resend = new Resend(apiKey);
      this.fromEmail = fromEmail;
    } else {
      this.resend = null;
      this.fromEmail = '';
      this.logger.warn(
        'RESEND_API_KEY o RESEND_FROM_EMAIL no configurados — los emails no se enviarán.',
      );
    }

    this.fromName = this.configService.get<string>('RESEND_FROM_NAME', 'SaaS AR');
  }

  get isConfigured(): boolean {
    return this.resend !== null;
  }

  async send(options: SendMailOptions): Promise<{ id: string }> {
    if (!this.resend) {
      this.logger.warn(`Email a ${options.to} omitido (sin proveedor configurado).`);
      return { id: '' };
    }
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from ?? `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
        })),
      });

      if (error) {
        this.logger.error(`Error al enviar email a ${options.to}: ${error.message}`);
        return { id: '' };
      }

      this.logger.log(`Email enviado a ${options.to} [id=${data?.id}]`);
      return { id: data!.id };
    } catch (err) {
      this.logger.error(
        `Excepción al enviar email a ${options.to}`,
        err instanceof Error ? err.stack : String(err),
      );
      return { id: '' };
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<{ id: string }> {
    const appUrl = this.configService.getOrThrow<string>('APP_URL');
    const link = `${appUrl}/auth/verify-email?token=${token}`;

    return this.send({
      to,
      subject: 'Verificá tu email',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2>Hola ${name},</h2>
            <p>Gracias por registrarte. Hacé click en el siguiente botón para verificar tu email:</p>
            <p style="margin:32px 0">
              <a href="${link}"
                 style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
                Verificar email
              </a>
            </p>
            <p style="color:#666;font-size:14px">Este link expira en 24 horas.</p>
            <p style="color:#666;font-size:14px">Si no creaste esta cuenta, ignorá este mensaje.</p>
          </body>
        </html>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<{ id: string }> {
    const appUrl = this.configService.getOrThrow<string>('APP_URL');
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    return this.send({
      to,
      subject: 'Restablecé tu contraseña',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2>Hola ${name},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p style="margin:32px 0">
              <a href="${link}"
                 style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
                Restablecer contraseña
              </a>
            </p>
            <p style="color:#666;font-size:14px">Este link expira en 1 hora.</p>
            <p style="color:#666;font-size:14px">Si no solicitaste esto, ignorá este mensaje.</p>
          </body>
        </html>
      `,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<{ id: string }> {
    return this.send({
      to,
      subject: `¡Bienvenido/a a ${this.fromName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2>¡Hola ${name}!</h2>
            <p>Tu cuenta fue verificada exitosamente. Ya podés iniciar sesión y empezar a usar la plataforma.</p>
            <p style="color:#666;font-size:14px">Si tenés alguna duda, respondé este email.</p>
          </body>
        </html>
      `,
    });
  }
}
