export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailService {
  send(params: SendEmailParams): Promise<void>;
}
