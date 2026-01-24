import { getResendClient, EMAIL_FROM } from "./client";
import { getWelcomeEmailHtml, welcomeEmailSubject } from "./templates/welcome";
import {
  getLowUsageEmailHtml,
  lowUsageEmailSubject,
} from "./templates/low-usage";
import logger from "@/lib/logger";

/**
 * Generate unsubscribe link for email footer
 */
export function getUnsubscribeLink(userId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://distribuia.com";
  const token = generateUnsubscribeToken(userId);
  return `${baseUrl}/api/user/email-preferences?token=${token}&user=${userId}`;
}

/**
 * Generate a simple unsubscribe token
 */
function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET || "default-secret";
  let hash = 0;
  const str = `${userId}:${secret}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get unsubscribe footer HTML
 */
function getUnsubscribeFooter(userId: string): string {
  const unsubscribeLink = getUnsubscribeLink(userId);
  return `
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">
          Darse de baja de estos emails
        </a>
      </p>
    </div>
  `;
}

export async function sendWelcomeEmail(
  to: string,
  userName?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping welcome email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getWelcomeEmailHtml(userName);

    // Add unsubscribe link if userId is provided
    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: welcomeEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send welcome email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Welcome email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendLowUsageEmail(
  to: string,
  used: number,
  limit: number,
  plan: "free" | "starter" | "pro",
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping low usage email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getLowUsageEmailHtml(used, limit, plan);

    // Add unsubscribe link if userId is provided
    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: lowUsageEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send low usage email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Low usage email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Check if user has email notifications enabled
 */
export async function shouldSendEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("users")
      .select("email_notifications_enabled")
      .eq("id", userId)
      .single();

    // Default to true if not set
    return data?.email_notifications_enabled !== false;
  } catch {
    return true; // Default to sending on error
  }
}
