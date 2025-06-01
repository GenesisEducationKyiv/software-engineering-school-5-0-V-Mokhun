import { WeatherService } from "@/lib/weather";
import { HTTP_STATUS_CODE } from "@/constants"; 
import { describe, expect, it, jest, beforeEach } from "@jest/globals";

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

    const weatherService = new WeatherService("test-api-key");
    const result = await weatherService.getWeatherData("London");

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
      status: HTTP_STATUS_CODE.NOT_FOUND,
      statusText: "Not Found",
    } as Response);

    const weatherService = new WeatherService("test-api-key");
    await expect(
      weatherService.getWeatherData("NonExistentCity")
    ).rejects.toThrow(
      "Failed to fetch weather data for NonExistentCity: Not Found"
    );
  });

  it("should throw not found error if data is not correct", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          someOtherData: {},
        }),
    } as Response);

    const weatherService = new WeatherService("test-api-key");
    await expect(weatherService.getWeatherData("London")).rejects.toThrow(
      "Weather data not found"
    );
  });
});
