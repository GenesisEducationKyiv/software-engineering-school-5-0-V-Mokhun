import {
  EmailLogCreateInput,
  IDatabase,
  IEmailLogRepository,
} from "@/shared/ports";

export class EmailLogRepository implements IEmailLogRepository {
  constructor(private readonly db: IDatabase) {}

  async create(data: EmailLogCreateInput): Promise<void> {
    await this.db.emailLog.create({ data });
  }
}
