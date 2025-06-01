import { queryValidator } from "@/middleware";
import { ParsedRequest } from "@/types/global";
import { Router } from "express";
import * as weatherController from "./weather.controller";
import { GetWeatherQuery, GetWeatherQuerySchema } from "./weather.schema";

const router = Router();

export type GetWeatherRequest = ParsedRequest<{}, {}, {}, GetWeatherQuery>;
router.get("/", queryValidator(GetWeatherQuerySchema), (req, res, next) =>
  weatherController.getWeather(req as unknown as GetWeatherRequest, res, next)
);

export { router as weatherRouter };
