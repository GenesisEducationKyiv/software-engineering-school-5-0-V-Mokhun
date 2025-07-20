-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('hourly', 'daily');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmToken" TEXT,
    "confirm_token_expires_at" TIMESTAMP(3),
    "unsubscribeToken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_sent_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_confirmToken_key" ON "subscriptions"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_unsubscribeToken_key" ON "subscriptions"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_city_key" ON "subscriptions"("email", "city");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_city_key" ON "weather_cache"("city");
