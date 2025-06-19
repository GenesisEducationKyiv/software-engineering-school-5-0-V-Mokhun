import { jest } from "@jest/globals";
import { IWeatherProvider, WeatherData } from "@/shared/ports";

export const createMockWeatherProvider = (): jest.Mocked<IWeatherProvider> => ({
  getWeatherData: jest.fn(),
});

export const mockWeatherProvider = createMockWeatherProvider();

export const mockWeatherData: WeatherData = {
  temperature: 25,
  humidity: 60,
  description: "Sunny",
};

export class MockWeatherProvider implements IWeatherProvider {
  constructor(private readonly shouldFail: boolean = false) {}

  getWeatherData(_city: string): Promise<WeatherData> {
    if (this.shouldFail) {
      return Promise.reject(new Error("Provider failed"));
    }
    return Promise.resolve(mockWeatherData);
  }
} 
