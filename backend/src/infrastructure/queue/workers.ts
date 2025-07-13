import { getLogger } from "@/shared/logger";
import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";

const logger = getLogger();
const db = getDb();

export const workers = composeWorkers(db, logger);
