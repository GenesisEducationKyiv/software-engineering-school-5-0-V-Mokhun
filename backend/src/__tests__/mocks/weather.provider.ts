import { jest } from "@jest/globals";
import { IWeatherProvider } from "@/shared/ports";

export const createMockWeatherProvider = (): jest.Mocked<IWeatherProvider> => ({
  getWeatherData: jest.fn(),
});

export const mockWeatherProvider = createMockWeatherProvider(); 
