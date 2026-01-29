import { getResendClient, EMAIL_FROM } from "./client";
import { getWelcomeEmailHtml, welcomeEmailSubject } from "./templates/welcome";
import {
  getLowUsageEmailHtml,
  lowUsageEmailSubject,
} from "./templates/low-usage";
import {
  getSubscriptionConfirmedEmailHtml,
  subscriptionConfirmedEmailSubject,
} from "./templates/subscription-confirmed";
import {
  getSubscriptionCancelledEmailHtml,
  subscriptionCancelledEmailSubject,
} from "./templates/subscription-cancelled";
import {
  getLimitReachedEmailHtml,
  limitReachedEmailSubject,
} from "./templates/limit-reached";
import {
  getReengagementEmailHtml,
  reengagementEmailSubject,
} from "./templates/reengagement";
import {
  getMonthlyResetEmailHtml,
  monthlyResetEmailSubject,
} from "./templates/monthly-reset";
import { getUnsubscribeUrl } from "./token";
import logger from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Generate unsubscribe link for email footer
 * @deprecated Use getUnsubscribeUrl from ./token instead
 */
export function getUnsubscribeLink(userId: string): string {
  return getUnsubscribeUrl(userId);
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
  supabase: SupabaseClient<Database>,
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

export async function sendSubscriptionConfirmedEmail(
  to: string,
  planName: string,
  conversionsLimit: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping subscription confirmed email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getSubscriptionConfirmedEmailHtml(planName, conversionsLimit);

    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: subscriptionConfirmedEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send subscription confirmed email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Subscription confirmed email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendSubscriptionCancelledEmail(
  to: string,
  planName: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping subscription cancelled email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getSubscriptionCancelledEmailHtml(planName);

    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: subscriptionCancelledEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send subscription cancelled email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Subscription cancelled email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendLimitReachedEmail(
  to: string,
  limit: number,
  plan: "free" | "starter" | "pro",
  nextResetDate: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping limit reached email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getLimitReachedEmailHtml(limit, plan, nextResetDate);

    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: limitReachedEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send limit reached email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Limit reached email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendReengagementEmail(
  to: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping reengagement email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getReengagementEmailHtml();

    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: reengagementEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send reengagement email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Reengagement email error", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendMonthlyResetEmail(
  to: string,
  conversionsLimit: number,
  planName: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      logger.warn("Resend client not available, skipping monthly reset email");
      return { success: false, error: "Email service not configured" };
    }

    let html = getMonthlyResetEmailHtml(conversionsLimit, planName);

    if (userId) {
      html = html.replace("</body>", `${getUnsubscribeFooter(userId)}</body>`);
    }

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: monthlyResetEmailSubject,
      html,
    });

    if (error) {
      logger.error("Failed to send monthly reset email", new Error(error.message));
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logger.error("Monthly reset email error", err);
    return { success: false, error: "Failed to send email" };
  }
}
