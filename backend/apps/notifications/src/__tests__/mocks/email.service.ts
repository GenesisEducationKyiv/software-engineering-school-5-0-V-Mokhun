import { jest } from "@jest/globals";
import {
  ConfirmationEmailParams,
  IEmailService,
  WeatherUpdateEmailParams,
} from "@/shared/ports";

export class MockEmailService implements IEmailService {
  public sentConfirmationEmails: ConfirmationEmailParams[] = [];
  public sentWeatherUpdateEmails: WeatherUpdateEmailParams[] = [];

  async sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
    this.sentConfirmationEmails.push(params);
  }

  async sendWeatherUpdateEmail(
    params: WeatherUpdateEmailParams
  ): Promise<void> {
    this.sentWeatherUpdateEmails.push(params);
  }

  clear() {
    this.sentConfirmationEmails = [];
    this.sentWeatherUpdateEmails = [];
  }
}

export const createMockEmailService = (): jest.Mocked<IEmailService> => ({
  sendConfirmationEmail: jest.fn(),
  sendWeatherUpdateEmail: jest.fn(),
});

export const mockEmailService = new MockEmailService();
export const mockEmailServiceJest = createMockEmailService();
