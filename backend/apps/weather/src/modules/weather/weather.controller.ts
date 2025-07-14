import { NextFunction, Response } from "express";
import { GetWeatherRequest } from "./weather.types";
import { WeatherData } from "@common/shared/ports";

export interface IWeatherService {
  getWeather(city: string): Promise<WeatherData>;
}

export class WeatherController {
  constructor(private readonly service: IWeatherService) {}

  getWeather = async (
    req: GetWeatherRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { city } = req.parsedQuery;
      const data = await this.service.getWeather(city);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };
}
