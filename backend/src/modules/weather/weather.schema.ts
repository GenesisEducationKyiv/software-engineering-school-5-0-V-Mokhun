import { z } from "zod";

export const GetWeatherQuerySchema = z
  .object({
    city: z.string().min(1),
  })
  .strict();
export type GetWeatherQuery = z.infer<typeof GetWeatherQuerySchema>;
