-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_subscription_id_idx" ON "email_logs"("subscription_id");
