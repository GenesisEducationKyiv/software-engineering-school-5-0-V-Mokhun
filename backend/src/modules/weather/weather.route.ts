import { queryValidator } from "@/middleware";
import { Router } from "express";
import { GetWeatherQuerySchema } from "./weather.schema";
import { GetWeatherRequest } from "./weather.types";
import { WeatherController } from "./weather.controller";

export const createWeatherRouter = (controller: WeatherController) => {
  const router = Router();

  router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
    controller.getWeather(req as GetWeatherRequest, res, next)
  );

  return router;
};
