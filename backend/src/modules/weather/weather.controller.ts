import { NextFunction, Response } from "express";
import { GetWeatherRequest } from "./weather.types";
import { WeatherData } from "@/infrastructure/weather";

export interface IWeatherService {
  getWeather(city: string): Promise<WeatherData>;
  upsertWeatherCache(city: string, data: WeatherData): Promise<void>;
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
