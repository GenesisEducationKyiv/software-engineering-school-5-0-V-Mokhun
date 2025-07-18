import { http, HttpResponse, passthrough } from "msw";
import { WeatherData } from "@common/shared/ports";
import { OpenMeteoGeocodingResponse } from "@/infrastructure/weather";
import { mapWeatherCodeToDescription } from "@/infrastructure/weather/mappers";

export const mockWeatherApiSuccessResponse = {
  current: {
    temp_c: 20,
    humidity: 50,
    condition: {
      text: "Sunny",
    },
  },
};

export const mockOpenMeteoGeocodingResponse: OpenMeteoGeocodingResponse = {
  results: [
    {
      latitude: 40.7128,
      longitude: -74.006,
    },
  ],
};

export const mockOpenMeteoWeatherResponse = {
  current: {
    temperature_2m: 23,
    relative_humidity_2m: 52,
    weather_code: 3,
  },
};

export const mockWeatherDataFromApi: WeatherData = {
  temperature: mockWeatherApiSuccessResponse.current.temp_c,
  humidity: mockWeatherApiSuccessResponse.current.humidity,
  description: mockWeatherApiSuccessResponse.current.condition.text,
};

export const mockWeatherDataFromOpenMeteo: WeatherData = {
  temperature: mockOpenMeteoWeatherResponse.current.temperature_2m,
  humidity: mockOpenMeteoWeatherResponse.current.relative_humidity_2m,
  description: mapWeatherCodeToDescription(
    mockOpenMeteoWeatherResponse.current.weather_code
  ),
};

export const handlers = [
  http.all("http://127.0.0.1*", () => passthrough()),
  http.get("https://api.weatherapi.com/v1/current.json", ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get("q");
    const key = url.searchParams.get("key");

    if (!city || !key) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockWeatherApiSuccessResponse);
  }),
  http.get("https://geocoding-api.open-meteo.com/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get("name");

    if (!city) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockOpenMeteoGeocodingResponse);
  }),
  http.get("https://api.open-meteo.com/v1/forecast", ({ request }) => {
    const url = new URL(request.url);
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");

    if (!latitude || !longitude) {
      return HttpResponse.error();
    }

    return HttpResponse.json(mockOpenMeteoWeatherResponse);
  }),
];
