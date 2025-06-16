import { queryValidator } from "@/middleware";
import { Router } from "express";
import { createWeatherController } from "./weather.factory";
import { GetWeatherQuerySchema } from "./weather.schema";
import { GetWeatherRequest } from "./weather.types";
import { getDb } from "@/db";
import { getLogger } from "@/shared/logger";
import { env } from "@/config";

const router = Router();

const controller = createWeatherController({
  db: getDb(),
  logger: getLogger(),
  apiKey: env.WEATHER_API_KEY,
});

router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
  controller.getWeather(req as GetWeatherRequest, res, next)
);

export { router as weatherRouter };
