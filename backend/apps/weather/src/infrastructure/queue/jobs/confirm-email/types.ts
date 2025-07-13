export const CONFIRM_EMAIL_JOB = "confirm-email";

export type ConfirmEmailJobData = {
  email: string;
  city: string;
  confirmToken: string;
}; 
