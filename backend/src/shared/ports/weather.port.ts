export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

export interface IWeatherProvider {
  getWeatherData(city: string): Promise<WeatherData>;
}
