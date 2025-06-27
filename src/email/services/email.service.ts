import { Injectable, NotAcceptableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: object,
    attachments: object[],
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        template: `../templates/${template}`,
        context,
        attachments,
      });
      return true;
    } catch (error) {
      throw new NotAcceptableException(
        `Error al enviar el email` + error.message,
      );
    }
  }
}
