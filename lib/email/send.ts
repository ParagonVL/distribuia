import { getResendClient, EMAIL_FROM } from "./client";
import { getWelcomeEmailHtml, welcomeEmailSubject } from "./templates/welcome";
import {
  getLowUsageEmailHtml,
  lowUsageEmailSubject,
} from "./templates/low-usage";

export async function sendWelcomeEmail(
  to: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("Resend client not available, skipping welcome email");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: welcomeEmailSubject,
      html: getWelcomeEmailHtml(userName),
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Welcome email error:", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendLowUsageEmail(
  to: string,
  used: number,
  limit: number,
  plan: "free" | "starter" | "pro"
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("Resend client not available, skipping low usage email");
      return { success: false, error: "Email service not configured" };
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: lowUsageEmailSubject,
      html: getLowUsageEmailHtml(used, limit, plan),
    });

    if (error) {
      console.error("Failed to send low usage email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Low usage email error:", err);
    return { success: false, error: "Failed to send email" };
  }
}
