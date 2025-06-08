import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config";
import { errorMiddleware } from "./middleware";
import { subscriptionRouter, weatherRouter } from "./modules";

export const app = express();

if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.send("OK");
});

app.use("/api", subscriptionRouter);
app.use("/api/weather", weatherRouter);

app.use(errorMiddleware);
