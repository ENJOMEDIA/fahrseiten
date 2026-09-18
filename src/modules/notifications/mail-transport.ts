import nodemailer from "nodemailer";
export type MailMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
};
export interface MailTransport {
  send(message: MailMessage): Promise<void>;
}
export class SmtpMailTransport implements MailTransport {
  private readonly transporter;
  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    password?: string;
  }) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth:
        config.user && config.password
          ? { user: config.user, pass: config.password }
          : undefined,
      requireTLS: !config.secure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  async send(message: MailMessage) {
    await this.transporter.sendMail(message);
  }
}
export class CatchMailTransport implements MailTransport {
  readonly messages: MailMessage[] = [];
  async send(message: MailMessage) {
    this.messages.push(structuredClone(message));
  }
}
