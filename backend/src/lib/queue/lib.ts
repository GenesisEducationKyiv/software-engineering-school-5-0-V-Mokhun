import { Worker } from "bullmq";
import { JOB_TYPES } from "./constants";
import {
  ConfirmEmailWorker,
  SendWeatherUpdateEmailWorker,
  UpdateWeatherDataWorker,
} from "./jobs";

const WorkerMap = new Map<string, Worker<any, any, string>>([
  [JOB_TYPES.CONFIRM_EMAIL, ConfirmEmailWorker],
  [JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL, SendWeatherUpdateEmailWorker],
  [JOB_TYPES.UPDATE_WEATHER_DATA, UpdateWeatherDataWorker],
]);

export function initializeJobs() {
  WorkerMap.forEach((worker, jobType) => {
    worker.on("error", (error) => {
      console.error(`Worker ${jobType} error:`, error);
    });
  });
}

export async function stopJobs() {
  return Promise.all(
    Array.from(WorkerMap.values()).map((worker) => worker.close())
  );
}
