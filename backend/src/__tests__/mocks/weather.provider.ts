import { jest } from "@jest/globals";
import { IWeatherProvider, WeatherData } from "@/shared/ports";
import { mockWeatherData } from "./weather";

export const createMockWeatherProvider = (): jest.Mocked<IWeatherProvider> => ({
  getWeatherData: jest.fn(),
});

export const mockWeatherProvider = createMockWeatherProvider();

export class MockWeatherProvider implements IWeatherProvider {
  constructor(private readonly shouldFail: boolean = false) {}

  getWeatherData(_city: string): Promise<WeatherData> {
    if (this.shouldFail) {
      return Promise.reject(new Error("Provider failed"));
    }
    return Promise.resolve(mockWeatherData);
  }
}
