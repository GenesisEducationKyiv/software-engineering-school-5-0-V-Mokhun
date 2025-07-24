import { ParsedRequest } from "@/types/global";
import {
  ConfirmSubscriptionParams,
  SubscribeBody,
  UnsubscribeParams,
} from "./subscription.schema";

export type ConfirmSubscriptionRequest =
  ParsedRequest<ConfirmSubscriptionParams>;
export type UnsubscribeRequest = ParsedRequest<UnsubscribeParams>;
export type SubscribeRequest = ParsedRequest<{}, {}, SubscribeBody>;
