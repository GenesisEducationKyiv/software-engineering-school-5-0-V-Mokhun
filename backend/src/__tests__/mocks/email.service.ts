import { IEmailService, SendEmailParams } from "@/shared/ports";

export class MockEmailService implements IEmailService {
  public sentEmails: SendEmailParams[] = [];

  async send(params: SendEmailParams): Promise<void> {
    this.sentEmails.push(params);
  }

  clear() {
    this.sentEmails = [];
  }
}

export const mockEmailService = new MockEmailService();
