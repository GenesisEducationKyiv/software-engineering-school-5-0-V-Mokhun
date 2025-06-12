import { SendWeatherUpdateEmailProcessor } from "./send-weather-update-email.processor";

const instance = new SendWeatherUpdateEmailProcessor();

export default instance.handle.bind(instance);
