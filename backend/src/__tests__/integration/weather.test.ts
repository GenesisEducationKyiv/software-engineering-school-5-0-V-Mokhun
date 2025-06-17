import { app } from "@/app";
import { CACHE_THRESHOLD } from "@/constants";
import { db } from "@/db";
import { GetWeatherQuery } from "@/modules/weather/weather.schema";
import { WeatherData } from "@/shared/ports";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { WeatherCache } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { http, HttpResponse } from "msw";
import request from "supertest";
import { server } from "../mocks/node";

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
    it("should return correct weather data and cache it", async () => {
      const query: GetWeatherQuery = { city: "London" };
      const now = new Date();

      const response = await request(app).get("/api/weather").query(query);

      const after = new Date();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockWeatherData);
      const cached = await db.weatherCache.findUnique({
        where: {
          city: "London",
        },
      });
      expect(cached).toBeDefined();
      expect(cached?.fetchedAt?.getTime()).toBeGreaterThan(now.getTime());
      expect(cached?.fetchedAt?.getTime()).toBeLessThan(after.getTime());
    });

    it("should return correct weather data from cache", async () => {
      const query: GetWeatherQuery = { city: "London" };
      const now = new Date();
      const fetchedAt = new Date(now.getTime() - CACHE_THRESHOLD + 1000);
      const cachedData: WeatherCache = {
        id: 1,
        city: "London",
        temperature: mockWeatherData.temperature,
        humidity: mockWeatherData.humidity,
        description: mockWeatherData.description,
        fetchedAt,
      };
      await db.weatherCache.create({
        data: cachedData,
      });

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockWeatherData);
      const cached = await db.weatherCache.findUnique({
        where: {
          city: "London",
        },
      });
      expect(cached).toBeDefined();
      expect(cached?.fetchedAt?.getTime()).toEqual(fetchedAt.getTime());
    });

    //? I cannot figure out how to manipulate time to test this
    // it("should handle external service response timeout", async () => {
    //   server.use(
    //     http.get("https://api.weatherapi.com/v1/current.json", async () => {
    //       await delay("infinite");

    //       return new Response();
    //     })
    //   );

    //   const response = await request(app).get("/api/weather").query({
    //     city: "London",
    //   });

    //   expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    // });

    it("should return 400 for missing city parameter", async () => {
      const response = await request(app).get("/api/weather").query({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty("errors");
      expect(response.body).toHaveProperty("message");
    });

    it("should handle external service errors", async () => {
      const query: GetWeatherQuery = { city: "London" };
      server.use(
        http.get("https://api.weatherapi.com/v1/current.json", () => {
          return HttpResponse.error();
        })
      );

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty("message");
    });
  });
});
