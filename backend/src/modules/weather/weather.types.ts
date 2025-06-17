import { ParsedRequest } from "@/types/global";
import { GetWeatherQuery } from "./weather.schema";

export type GetWeatherRequest = ParsedRequest<{}, {}, {}, GetWeatherQuery>; 
