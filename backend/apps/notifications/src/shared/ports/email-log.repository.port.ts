import { Prisma } from "@prisma/client";

export type EmailLogCreateInput = Prisma.EmailLogCreateArgs["data"];

export interface IEmailLogRepository {
  create(data: EmailLogCreateInput): Promise<void>;
}
