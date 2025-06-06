export const QUEUE_TYPES = {
  CONFIRM_EMAIL: "confirm_email_queue",
  WEATHER_UPDATE: "weather_update_queue",
  SEND_WEATHER_UPDATE_EMAIL: "send_weather_update_email_queue",
} as const;

export const JOB_TYPES = {
  CONFIRM_EMAIL: "confirm_email",
  SEND_WEATHER_UPDATE_EMAIL: "send_weather_update_email",
  UPDATE_WEATHER_DATA: "update_weather_data",
} as const;
