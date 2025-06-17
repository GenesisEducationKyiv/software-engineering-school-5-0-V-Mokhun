import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import {
  HttpException,
  ServerErrorException
} from "@/shared";
import { getLogger } from "@/shared/logger";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const mockWeatherProvider = createWeatherProvider({
  logger: getLogger(),
  apiKey: "test-api-key",
});
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("WeatherService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should fetch weather data for a city", async () => {
    const mockWeatherData = {
      current: {
        temp_c: 20,
        humidity: 50,
        condition: {
          text: "Sunny",
        },
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    } as Response);

    const result = await mockWeatherProvider.getWeatherData("London");

    expect(result).toEqual({
      temperature: 20,
      description: "Sunny",
      humidity: 50,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.weatherapi.com/v1/current.json?key=test-api-key&q=London&aqi=no",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("should throw an error if the city is not found", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: StatusCodes.NOT_FOUND,
      statusText: ReasonPhrases.NOT_FOUND,
    } as Response);

    await expect(
      mockWeatherProvider.getWeatherData("NonExistentCity")
    ).rejects.toThrowError(HttpException);
  });

  it("should throw not found error if weather data is not correct", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          someOtherData: {},
        }),
    } as Response);

    await expect(
      mockWeatherProvider.getWeatherData("London")
    ).rejects.toThrowError(ServerErrorException);
  });
});
