import { queryValidator } from "@/middleware";
import { Router } from "express";
import { WeatherController } from "./weather.controller";
import { GetWeatherQuerySchema } from "./weather.schema";
import { GetWeatherRequest } from "./weather.types";

export const createWeatherRouter = (controller: WeatherController) => {
  const router = Router();

  router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
    controller.getWeather(req as GetWeatherRequest, res, next)
  );

  return router;
};
