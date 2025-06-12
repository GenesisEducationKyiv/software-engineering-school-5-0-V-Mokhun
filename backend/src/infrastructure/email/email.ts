import sgMail from "@sendgrid/mail";
import { env } from "@/config";

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: env.SENDGRID_FROM_EMAIL,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
};
