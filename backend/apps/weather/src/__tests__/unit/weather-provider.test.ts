import { WeatherProvider } from "@/infrastructure/weather/weather.provider";
import { IWeatherProvider } from "@/shared/ports";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mockLogger, mockWeatherData, MockWeatherProvider } from "../mocks";

describe("WeatherProvider", () => {
  let provider1: IWeatherProvider;
  let provider2: IWeatherProvider;
  const city = "London";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return data from the first provider if it succeeds", async () => {
    provider1 = new MockWeatherProvider(false);
    provider2 = new MockWeatherProvider(false);
    const getWeatherDataSpy1 = jest.spyOn(provider1, "getWeatherData");
    const getWeatherDataSpy2 = jest.spyOn(provider2, "getWeatherData");

    const weatherProvider = new WeatherProvider(
      [provider1, provider2],
      mockLogger,
    );
    const result = await weatherProvider.getWeatherData(city);

    expect(result).toEqual(mockWeatherData);
    expect(getWeatherDataSpy1).toHaveBeenCalledWith(city);
    expect(getWeatherDataSpy2).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it("should return data from the second provider if the first one fails", async () => {
    provider1 = new MockWeatherProvider(true);
    provider2 = new MockWeatherProvider(false);
    const getWeatherDataSpy1 = jest.spyOn(provider1, "getWeatherData");
    const getWeatherDataSpy2 = jest.spyOn(provider2, "getWeatherData");

    const weatherProvider = new WeatherProvider(
      [provider1, provider2],
      mockLogger,
    );
    const result = await weatherProvider.getWeatherData(city);

    expect(result).toEqual(mockWeatherData);
    expect(getWeatherDataSpy1).toHaveBeenCalledWith(city);
    expect(getWeatherDataSpy2).toHaveBeenCalledWith("London");
    expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if all providers fail", async () => {
    provider1 = new MockWeatherProvider(true);
    provider2 = new MockWeatherProvider(true);
    const getWeatherDataSpy1 = jest.spyOn(provider1, "getWeatherData");
    const getWeatherDataSpy2 = jest.spyOn(provider2, "getWeatherData");

    const weatherProvider = new WeatherProvider(
      [provider1, provider2],
      mockLogger,
    );

    await expect(weatherProvider.getWeatherData(city)).rejects.toThrow();

    expect(getWeatherDataSpy1).toHaveBeenCalledWith(city);
    expect(getWeatherDataSpy2).toHaveBeenCalledWith(city);
    expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
  });
});
