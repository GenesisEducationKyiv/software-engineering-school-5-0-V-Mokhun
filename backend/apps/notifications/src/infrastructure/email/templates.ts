import { WeatherData } from "@common/generated/proto/job_pb";

export const getConfirmEmailTemplate = (city: string, confirmUrl: string) => `
    <h1>Confirm your subscription</h1>
    <p>Please confirm your subscription for weather updates in ${city} by clicking the link below:</p>
    <a href="${confirmUrl}">Confirm subscription</a>
`;

export const getWeatherUpdateTemplate = (
  city: string,
  weather: WeatherData,
  unsubscribeUrl: string
) => `
    <h1>Weather Update for ${city}</h1>
    <p>Here is your daily weather update:</p>
    <ul>
        <li>Temperature: ${weather.temperature}°C</li>
        <li>Humidity: ${weather.humidity}%</li>
        <li>Description: ${weather.description}</li>
    </ul>
    <p>If you wish to unsubscribe, please click the link below:</p>
    <a href="${unsubscribeUrl}">Unsubscribe</a>
`;
