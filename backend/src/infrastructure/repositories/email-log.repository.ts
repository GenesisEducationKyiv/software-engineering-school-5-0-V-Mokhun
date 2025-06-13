import { PrismaClient } from "@prisma/client";
import { EmailLogCreateInput, IEmailLogRepository } from "@/shared/ports";

export class EmailLogRepository implements IEmailLogRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: EmailLogCreateInput): Promise<void> {
    await this.db.emailLog.create({ data });
  }
}
