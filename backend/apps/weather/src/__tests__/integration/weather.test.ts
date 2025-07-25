import { app } from "@/app";
import { CACHE_THRESHOLD } from "@common/constants";
import { db } from "@/db";
import { GetWeatherQuery } from "@/modules/weather/weather.schema";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { WeatherCache } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { http, HttpResponse } from "msw";
import request from "supertest";
import {
  mockWeatherDataFromApi,
  mockWeatherDataFromOpenMeteo,
} from "../mocks/handlers";
import { server } from "../mocks/node";

describe("Weather Endpoints", () => {
  const city = "London";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("GET /api/weather", () => {
    it("should return correct weather data from the first provider and cache it", async () => {
      const query: GetWeatherQuery = { city };
      const now = new Date();

      const response = await request(app).get("/api/weather").query(query);

      const after = new Date();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockWeatherDataFromApi);
      const cached = await db.weatherCache.findUnique({
        where: {
          city,
        },
      });
      expect(cached).toBeDefined();
      expect(cached?.fetchedAt?.getTime()).toBeGreaterThan(now.getTime());
      expect(cached?.fetchedAt?.getTime()).toBeLessThan(after.getTime());
    });

    it("should return correct weather data from the second provider and cache it", async () => {
      server.use(
        http.get("https://api.weatherapi.com/v1/current.json", () => {
          return HttpResponse.error();
        })
      );
      const query: GetWeatherQuery = { city };
      const now = new Date();

      const response = await request(app).get("/api/weather").query(query);

      const after = new Date();

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockWeatherDataFromOpenMeteo);
      const cached = await db.weatherCache.findUnique({
        where: {
          city,
        },
      });
      expect(cached).toBeDefined();
      expect(cached?.fetchedAt?.getTime()).toBeGreaterThan(now.getTime());
      expect(cached?.fetchedAt?.getTime()).toBeLessThan(after.getTime());
    });

    it("should return correct weather data from cache", async () => {
      const query: GetWeatherQuery = { city };
      const now = new Date();
      const fetchedAt = new Date(now.getTime() - CACHE_THRESHOLD + 1000);
      const cachedData: WeatherCache = {
        id: 1,
        city,
        temperature: mockWeatherDataFromApi.temperature,
        humidity: mockWeatherDataFromApi.humidity,
        description: mockWeatherDataFromApi.description,
        fetchedAt,
      };
      await db.weatherCache.create({
        data: cachedData,
      });

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockWeatherDataFromApi);
      const cached = await db.weatherCache.findUnique({
        where: {
          city,
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
      const query: GetWeatherQuery = { city };
      server.use(
        http.get("https://api.weatherapi.com/v1/current.json", () => {
          return HttpResponse.error();
        }),
        http.get("https://geocoding-api.open-meteo.com/v1/search", () => {
          return HttpResponse.error();
        })
      );

      const response = await request(app).get("/api/weather").query(query);

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty("message");
    });
  });
});
