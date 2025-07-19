import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";
import { getLogger } from "@logger/logger.factory";

const logger = getLogger();
const db = getDb();

export const workers = composeWorkers(db, logger);
