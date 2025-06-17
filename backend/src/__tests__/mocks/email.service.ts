import { jest } from "@jest/globals";
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

export const createMockEmailService = (): jest.Mocked<IEmailService> => ({
  send: jest.fn(),
});

export const mockEmailService = new MockEmailService();
export const mockEmailServiceJest = createMockEmailService();
