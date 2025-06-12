import { createWorker } from "../worker-factory";
import { confirmEmailConfig } from "./confirm-email.config";
import { ConfirmEmailProcessor } from "./confirm-email.processor";
import { JOB_TYPES } from "../../constants";

const instance = new ConfirmEmailProcessor();

export const ConfirmEmailWorker = createWorker(
  confirmEmailConfig.queueName,
  confirmEmailConfig,
  instance,
  JOB_TYPES.CONFIRM_EMAIL
);
