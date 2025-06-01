import { UpdateWeatherDataProcessor } from "./update-weather-data.processor";

const instance = new UpdateWeatherDataProcessor();

export default instance.handle.bind(instance); 
