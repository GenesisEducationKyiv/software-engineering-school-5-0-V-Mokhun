export const mapWeatherCodeToDescription = (code: number): string => {
  switch (code) {
    case 0:
      return "Sunny";
    case 1:
      return "Mainly Sunny";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Cloudy";
    case 45:
      return "Foggy";
    case 48:
      return "Rime Fog";
    case 51:
      return "Light Drizzle";
    case 53:
      return "Moderate Drizzle";
    case 55:
      return "Dense Drizzle";
    case 56:
      return "Light Freezing Drizzle";
    case 57:
      return "Freezing Drizzle";
    case 61:
      return "Light Rain";
    case 63:
      return "Rain";
    case 65:
      return "Heavy Rain";
    case 66:
      return "Light Freezing Rain";
    case 67:
      return "Freezing Rain";
    case 71:
      return "Light Snow";
    case 73:
      return "Snow";
    case 75:
      return "Heavy Snow";
    case 77:
      return "Snow Grains";
    case 80:
      return "Light Showers";
    case 81:
      return "Showers";
    case 82:
      return "Heavy Showers";
    case 85:
      return "Light Snow Showers";
    case 86:
      return "Snow Showers";
    case 95:
      return "Thunderstorm";
    case 96:
      return "Light Thunderstorms With Hail";
    case 99:
      return "Thunderstorm With Hail";
    default:
      return "Unknown";
  }
};
