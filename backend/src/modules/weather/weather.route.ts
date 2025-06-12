import { queryValidator } from "@/middleware";
import { Router } from "express";
import { createWeatherController } from "./weather.factory";
import { GetWeatherQuerySchema } from "./weather.schema";
import { GetWeatherRequest } from "./weather.types";

const router = Router();

const controller = createWeatherController();

router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
  controller.getWeather(req as unknown as GetWeatherRequest, res, next)
);

export { router as weatherRouter };
