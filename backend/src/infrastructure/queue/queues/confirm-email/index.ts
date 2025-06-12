import { QUEUE_TYPES } from "../../constants";
import { ConfirmEmailJobData } from "../../jobs";
import { createQueue } from "../queue-factory";

export const ConfirmEmailQueue = createQueue<ConfirmEmailJobData>(
  QUEUE_TYPES.CONFIRM_EMAIL
);
