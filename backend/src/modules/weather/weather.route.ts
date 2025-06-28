import { env } from "@/config";
import { getDb } from "@/db";
import { queryValidator } from "@/middleware";
import { FileLogger, getLogger } from "@/shared/logger";
import { Router } from "express";
import { createWeatherController } from "./weather.factory";
import { GetWeatherQuerySchema } from "./weather.schema";
import { GetWeatherRequest } from "./weather.types";

const router = Router();

const controller = createWeatherController({
  db: getDb(),
  logger: new FileLogger(env.LOG_FILE_PATH),
  providersLogger: getLogger(),
  apiKey: env.WEATHER_API_KEY,
});

router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
  controller.getWeather(req as GetWeatherRequest, res, next)
);

export { router as weatherRouter };
