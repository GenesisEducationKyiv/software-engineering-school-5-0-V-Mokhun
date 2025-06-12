import { ParsedRequest } from "@/types/global";
import {
  ConfirmSubscriptionParams,
  SubscribeBody,
  UnsubscribeParams,
} from "./subscription.schema";
import { Prisma } from "@prisma/client";

export type ConfirmSubscriptionRequest =
  ParsedRequest<ConfirmSubscriptionParams>;
export type UnsubscribeRequest = ParsedRequest<UnsubscribeParams>;
export type SubscribeRequest = ParsedRequest<{}, {}, SubscribeBody>;

export type SubscriptionCreate = Prisma.SubscriptionUpsertArgs["create"];
