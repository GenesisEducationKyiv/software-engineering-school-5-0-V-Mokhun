import { prisma } from "@/__mocks__/@prisma/client";
import { app } from "@/app";
import { CACHE_THRESHOLD, HTTP_STATUS_CODE } from "@/constants";
import {
  WeatherData,
  weatherService as weatherExternalService,
} from "@/lib/weather";
import { GetWeatherQuery } from "@/modules/weather/weather.schema";
import * as weatherService from "@/modules/weather/weather.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { WeatherCache } from "@prisma/client";
import request from "supertest";

jest.mock("@/modules/weather/weather.service", () => ({
  upsertWeatherCache: jest.fn(),
}));

jest.mock("@/lib/weather", () => ({
  weatherService: {
    getWeatherData: jest.fn(),
  },
}));

describe("Weather Endpoints", () => {
  const mockWeatherData: WeatherData = {
    temperature: 20,
    description: "Sunny",
    humidity: 50,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("GET /api/weather", () => {
    it("should return cached weather data if cache is fresh", async () => {
      const query: GetWeatherQuery = { city: "London" };
      const now = new Date();
      const cachedData: WeatherCache = {
        id: 1,
        city: "London",
        temperature: mockWeatherData.temperature,
        humidity: mockWeatherData.humidity,
        description: mockWeatherData.description,
        fetchedAt: new Date(now.getTime() - (CACHE_THRESHOLD - 1000)), // Cache is still fresh
      };

      jest.mocked(prisma.weatherCache.findUnique).mockResolvedValue(cachedData);

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual(mockWeatherData);

      expect(weatherExternalService.getWeatherData).not.toHaveBeenCalled();
      expect(weatherService.upsertWeatherCache).not.toHaveBeenCalled();
    });

    it("should fetch new weather data if cache is stale", async () => {
      const query: GetWeatherQuery = { city: "London" };
      const now = new Date();
      const staleData: WeatherCache = {
        id: 1,
        city: "London",
        temperature: mockWeatherData.temperature,
        humidity: mockWeatherData.humidity,
        description: mockWeatherData.description,
        fetchedAt: new Date(now.getTime() - (CACHE_THRESHOLD + 1000)), // Cache is stale
      };

      jest.mocked(prisma.weatherCache.findUnique).mockResolvedValue(staleData);
      jest
        .mocked(weatherExternalService.getWeatherData)
        .mockResolvedValue(mockWeatherData);
      jest
        .mocked(weatherService.upsertWeatherCache)
        .mockResolvedValue(undefined);

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual(mockWeatherData);

      expect(weatherExternalService.getWeatherData).toHaveBeenCalledWith(
        "London"
      );
      expect(weatherService.upsertWeatherCache).toHaveBeenCalledWith(
        "London",
        mockWeatherData
      );
    });

    it("should fetch new weather data if no cache exists", async () => {
      const query: GetWeatherQuery = { city: "London" };

      jest.mocked(prisma.weatherCache.findUnique).mockResolvedValue(null);
      jest
        .mocked(weatherExternalService.getWeatherData)
        .mockResolvedValue(mockWeatherData);
      jest
        .mocked(weatherService.upsertWeatherCache)
        .mockResolvedValue(undefined);

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual(mockWeatherData);

      expect(weatherExternalService.getWeatherData).toHaveBeenCalledWith(
        "London"
      );
      expect(weatherService.upsertWeatherCache).toHaveBeenCalledWith(
        "London",
        mockWeatherData
      );
    });

    it("should return 400 for missing city parameter", async () => {
      const response = await request(app).get("/api/weather").query({});

      expect(response.status).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
      expect(response.body).toHaveProperty("errors");
      expect(response.body).toHaveProperty("message");
    });

    it("should handle external service errors", async () => {
      const query: GetWeatherQuery = { city: "London" };

      jest.mocked(prisma.weatherCache.findUnique).mockResolvedValue(null);
      jest
        .mocked(weatherExternalService.getWeatherData)
        .mockRejectedValue(new Error("Failed to fetch weather data"));

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty("message");
      expect(weatherService.upsertWeatherCache).not.toHaveBeenCalled();
    });
  });
});
